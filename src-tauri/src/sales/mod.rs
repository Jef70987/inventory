use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

#[derive(Deserialize)]
pub struct CartItem {
    pub product_id: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount: Option<f64>,
}

#[derive(Deserialize)]
pub struct CartPayment {
    pub method: String,
    pub amount: f64,
    pub reference: Option<String>,
}

#[derive(Serialize)]
pub struct SaleReceipt {
    pub id: String,
    pub receipt_no: String,
    pub subtotal: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub amount_paid: f64,
    pub change_due: f64,
    pub status: String,
    pub sold_at: String,
    pub cashier_name: Option<String>,
    pub customer_name: Option<String>,
    pub warehouse_name: Option<String>,
    pub items: Vec<SaleItemRow>,
    pub payments: Vec<SalePaymentRow>,
}

#[derive(Serialize)]
pub struct SaleItemRow {
    pub product_id: String,
    pub product_name: String,
    pub sku: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount: f64,
    pub line_total: f64,
}

#[derive(Serialize)]
pub struct SalePaymentRow {
    pub method: String,
    pub amount: f64,
    pub reference: Option<String>,
}

// ---------- Next receipt number ----------
fn format_receipt(n: i64) -> String {
    let year = chrono::Utc::now().format("%Y").to_string();
    format!("RCP-{}-{:04}", year, n)
}

#[tauri::command]
pub async fn preview_next_receipt(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<String, String> {
    let next: Option<i64> = sqlx::query_scalar(
        "SELECT next_receipt_no FROM store_settings LIMIT 1"
    ).fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

    Ok(format_receipt(next.unwrap_or(1)))
}

// ---------- Complete a sale ----------
#[tauri::command]
pub async fn complete_sale(
    pool: tauri::State<'_, SqlitePool>,
    items: Vec<CartItem>,
    payments: Vec<CartPayment>,
    customer_id: Option<String>,
    warehouse_id: Option<String>,
    user_id: Option<String>,
    discount_amount: Option<f64>,
    notes: Option<String>,
) -> Result<SaleReceipt, String> {
    if items.is_empty() {
        return Err("Cart is empty".into());
    }
    if payments.is_empty() {
        return Err("No payment provided".into());
    }

    // Resolve warehouse (default if not provided)
    let wid = match warehouse_id {
        Some(w) => w,
        None => sqlx::query_scalar::<_, String>(
            "SELECT id FROM warehouses WHERE is_default = 1 LIMIT 1"
        ).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
         .or_else(|| None)
         .ok_or("No default warehouse found. Create a warehouse first.")?,
    };
    // Handle case where fetch_optional returned Ok(None)
    let wid: String = if wid.is_empty() {
        sqlx::query_scalar::<_, String>(
            "SELECT id FROM warehouses ORDER BY created_at ASC LIMIT 1"
        ).fetch_one(&*pool).await.map_err(|e| e.to_string())?
    } else { wid };

    // Compute totals
    let mut subtotal: f64 = 0.0;
    for it in &items {
        let line = it.unit_price * it.quantity - it.discount.unwrap_or(0.0);
        subtotal += line;
    }
    let disc = discount_amount.unwrap_or(0.0);
    let total = (subtotal - disc).max(0.0);

    let amount_paid: f64 = payments.iter().map(|p| p.amount).sum();
    if amount_paid + 0.001 < total {
        return Err(format!("Payment {} is less than total {}", amount_paid, total));
    }
    let change_due = (amount_paid - total).max(0.0);

    // Get + increment receipt number
    let next_no: i64 = sqlx::query_scalar(
        "SELECT next_receipt_no FROM store_settings LIMIT 1"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    let receipt_no = format_receipt(next_no);

    // Begin transaction
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let sale_id = new_id();
    sqlx::query(
        "INSERT INTO sales
         (id, receipt_no, customer_id, session_id, cashier_id, warehouse_id,
          subtotal, discount_amount, total, amount_paid, change_due, status, sold_at, notes)
         VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)"
    )
    .bind(&sale_id).bind(&receipt_no).bind(&customer_id).bind(&user_id).bind(&wid)
    .bind(subtotal).bind(disc).bind(total).bind(amount_paid).bind(change_due)
    .bind(now_iso()).bind(&notes)
    .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    // Insert items, decrement stock, ledger
    for it in &items {
        let discount = it.discount.unwrap_or(0.0);
        let line_total = it.unit_price * it.quantity - discount;

        sqlx::query(
            "INSERT INTO sale_items
             (id, sale_id, product_id, variant_id, quantity, unit_price, discount, line_total)
             VALUES (?, ?, ?, NULL, ?, ?, ?, ?)"
        )
        .bind(new_id()).bind(&sale_id).bind(&it.product_id)
        .bind(it.quantity).bind(it.unit_price).bind(discount).bind(line_total)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

        // Check stock exists
        let stock_id: Option<String> = sqlx::query_scalar(
            "SELECT id FROM inventory_stock
             WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
        ).bind(&it.product_id).bind(&wid)
        .fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?;

        match stock_id {
            Some(sid) => {
                let current: f64 = sqlx::query_scalar("SELECT quantity FROM inventory_stock WHERE id = ?")
                    .bind(&sid).fetch_one(&mut *tx).await.map_err(|e| e.to_string())?;
                if current < it.quantity {
                    return Err(format!("Insufficient stock for product {}", it.product_id));
                }
                sqlx::query("UPDATE inventory_stock SET quantity = quantity - ?, updated_at = ? WHERE id = ?")
                    .bind(it.quantity).bind(now_iso()).bind(&sid)
                    .execute(&mut *tx).await.map_err(|e| e.to_string())?;
            }
            None => {
                return Err(format!("No stock record for product {} in this warehouse", it.product_id));
            }
        }

        // Ledger entry
        sqlx::query(
            "INSERT INTO stock_movements
             (id, product_id, warehouse_id, movement_type, quantity, reference_table, reference_id, created_by, created_at)
             VALUES (?, ?, ?, 'sale', ?, 'sales', ?, ?, ?)"
        )
        .bind(new_id()).bind(&it.product_id).bind(&wid)
        .bind(-it.quantity).bind(&sale_id).bind(&user_id).bind(now_iso())
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    // Payments
    for p in &payments {
        sqlx::query(
            "INSERT INTO sale_payments (id, sale_id, method, amount, reference, paid_at)
             VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(new_id()).bind(&sale_id).bind(&p.method).bind(p.amount).bind(&p.reference).bind(now_iso())
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    // Bump next receipt no
    sqlx::query("UPDATE store_settings SET next_receipt_no = next_receipt_no + 1")
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    // Update customer last_purchase
    if let Some(cid) = &customer_id {
        sqlx::query("UPDATE customers SET last_purchase_at = ? WHERE id = ?")
            .bind(now_iso()).bind(cid)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    // Build receipt
    let cashier_name: Option<String> = match &user_id {
        Some(uid) => sqlx::query_scalar("SELECT full_name FROM users WHERE id = ?")
            .bind(uid).fetch_optional(&*pool).await.ok().flatten(),
        None => None,
    };
    let customer_name: Option<String> = match &customer_id {
        Some(cid) => sqlx::query_scalar("SELECT name FROM customers WHERE id = ?")
            .bind(cid).fetch_optional(&*pool).await.ok().flatten(),
        None => None,
    };
    let warehouse_name: Option<String> = sqlx::query_scalar("SELECT name FROM warehouses WHERE id = ?")
        .bind(&wid).fetch_optional(&*pool).await.ok().flatten();

    let item_rows = sqlx::query(
        "SELECT si.product_id, p.name AS product_name, p.sku,
                si.quantity, si.unit_price, si.discount, si.line_total
         FROM sale_items si
         LEFT JOIN products p ON p.id = si.product_id
         WHERE si.sale_id = ?"
    ).bind(&sale_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let pay_rows = sqlx::query(
        "SELECT method, amount, reference FROM sale_payments WHERE sale_id = ?"
    ).bind(&sale_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(SaleReceipt {
        id: sale_id,
        receipt_no,
        subtotal,
        discount_amount: disc,
        total,
        amount_paid,
        change_due,
        status: "completed".into(),
        sold_at: now_iso(),
        cashier_name,
        customer_name,
        warehouse_name,
        items: item_rows.into_iter().map(|r| SaleItemRow {
            product_id: r.get("product_id"),
            product_name: r.get::<Option<String>, _>("product_name").unwrap_or_default(),
            sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
            quantity: r.get("quantity"),
            unit_price: r.get("unit_price"),
            discount: r.get("discount"),
            line_total: r.get("line_total"),
        }).collect(),
        payments: pay_rows.into_iter().map(|r| SalePaymentRow {
            method: r.get("method"),
            amount: r.get("amount"),
            reference: r.get("reference"),
        }).collect(),
    })
}

#[tauri::command]
pub async fn list_sales(
    pool: tauri::State<'_, SqlitePool>,
    limit: Option<i64>,
) -> Result<Vec<serde_json::Value>, String> {
    let lim = limit.unwrap_or(100);
    let rows = sqlx::query(
        "SELECT s.id, s.receipt_no, s.total, s.status, s.sold_at,
                c.name AS customer_name,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) AS items_count,
                (SELECT GROUP_CONCAT(method) FROM sale_payments WHERE sale_id = s.id) AS payment_methods
         FROM sales s
         LEFT JOIN customers c ON c.id = s.customer_id
         ORDER BY s.sold_at DESC
         LIMIT ?"
    ).bind(lim).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| serde_json::json!({
        "id": r.get::<String, _>("id"),
        "receipt_no": r.get::<String, _>("receipt_no"),
        "total": r.get::<f64, _>("total"),
        "status": r.get::<String, _>("status"),
        "sold_at": r.get::<String, _>("sold_at"),
        "customer_name": r.get::<Option<String>, _>("customer_name"),
        "items_count": r.get::<i64, _>("items_count"),
        "payment_methods": r.get::<Option<String>, _>("payment_methods"),
    })).collect())
}

#[tauri::command]
pub async fn get_sale(
    pool: tauri::State<'_, SqlitePool>,
    sale_id: String,
) -> Result<SaleReceipt, String> {
    let r = sqlx::query(
        "SELECT s.id, s.receipt_no, s.subtotal, s.discount_amount, s.total,
                s.amount_paid, s.change_due, s.status, s.sold_at,
                u.full_name AS cashier_name,
                c.name AS customer_name,
                w.name AS warehouse_name
         FROM sales s
         LEFT JOIN users u ON u.id = s.cashier_id
         LEFT JOIN customers c ON c.id = s.customer_id
         LEFT JOIN warehouses w ON w.id = s.warehouse_id
         WHERE s.id = ?"
    ).bind(&sale_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
     .ok_or("Sale not found")?;

    let item_rows = sqlx::query(
        "SELECT si.product_id, p.name AS product_name, p.sku,
                si.quantity, si.unit_price, si.discount, si.line_total
         FROM sale_items si
         LEFT JOIN products p ON p.id = si.product_id
         WHERE si.sale_id = ?"
    ).bind(&sale_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let pay_rows = sqlx::query(
        "SELECT method, amount, reference FROM sale_payments WHERE sale_id = ?"
    ).bind(&sale_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(SaleReceipt {
        id: r.get("id"),
        receipt_no: r.get("receipt_no"),
        subtotal: r.get("subtotal"),
        discount_amount: r.get("discount_amount"),
        total: r.get("total"),
        amount_paid: r.get("amount_paid"),
        change_due: r.get("change_due"),
        status: r.get("status"),
        sold_at: r.get("sold_at"),
        cashier_name: r.get("cashier_name"),
        customer_name: r.get("customer_name"),
        warehouse_name: r.get("warehouse_name"),
        items: item_rows.into_iter().map(|r| SaleItemRow {
            product_id: r.get("product_id"),
            product_name: r.get::<Option<String>, _>("product_name").unwrap_or_default(),
            sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
            quantity: r.get("quantity"),
            unit_price: r.get("unit_price"),
            discount: r.get("discount"),
            line_total: r.get("line_total"),
        }).collect(),
        payments: pay_rows.into_iter().map(|r| SalePaymentRow {
            method: r.get("method"),
            amount: r.get("amount"),
            reference: r.get("reference"),
        }).collect(),
    })
}

// ---------- Sales Returns ----------
#[derive(Serialize, Deserialize)]
pub struct ReturnItemInput {
    pub product_id: String,
    pub quantity: f64,
    pub unit_price: f64,
}

#[derive(Serialize)]
pub struct SaleReturn {
    pub id: String,
    pub return_number: String,
    pub sale_id: String,
    pub receipt_no: String,
    pub customer_name: Option<String>,
    pub reason: Option<String>,
    pub refund_method: Option<String>,
    pub refund_amount: f64,
    pub status: String,
    pub stock_disposition: String,
    pub created_at: String,
    pub item_count: i64,
    pub items: Vec<serde_json::Value>,
}

fn format_return(n: i64) -> String {
    let year = chrono::Utc::now().format("%Y").to_string();
    format!("RET-{}-{:04}", year, n)
}

#[tauri::command]
pub async fn create_return(
    pool: tauri::State<'_, SqlitePool>,
    sale_id: String,
    items: Vec<ReturnItemInput>,
    reason: Option<String>,
    refund_method: Option<String>,
    stock_disposition: Option<String>,
    user_id: Option<String>,
) -> Result<String, String> {
    if items.is_empty() {
        return Err("No items selected for return".into());
    }

    // Load sale
    let sale = sqlx::query(
        "SELECT id, receipt_no, warehouse_id, customer_id, status FROM sales WHERE id = ?"
    ).bind(&sale_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
     .ok_or("Sale not found")?;

    let sale_status: String = sale.get("status");
    if sale_status != "completed" {
        return Err(format!("Cannot create a return for a sale that is {}", sale_status));
    }

    let warehouse_id: Option<String> = sale.get("warehouse_id");
    let customer_id: Option<String> = sale.get("customer_id");

    // Generate return number (simple sequence)
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sale_returns")
        .fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    let return_number = format_return(count as i64 + 1);

    let refund_amount: f64 = items.iter().map(|i| i.quantity * i.unit_price).sum();

    let disposition = stock_disposition.unwrap_or_else(|| "restock".to_string());
    if disposition != "restock" && disposition != "write_off" {
        return Err("stock_disposition must be restock or write_off".into());
    }

    let return_id = new_id();
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO sale_returns
         (id, return_number, sale_id, customer_id, reason, refund_method, refund_amount, stock_disposition, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
    )
    .bind(&return_id).bind(&return_number).bind(&sale_id).bind(&customer_id)
    .bind(&reason).bind(&refund_method).bind(refund_amount).bind(&disposition)
    .bind(&user_id).bind(now_iso())
    .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &items {
        sqlx::query(
            "INSERT INTO sale_return_items (id, return_id, product_id, variant_id, quantity, unit_price)
             VALUES (?, ?, ?, NULL, ?, ?)"
        )
        .bind(new_id()).bind(&return_id).bind(&it.product_id)
        .bind(it.quantity).bind(it.unit_price)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(return_id)
}

#[tauri::command]
pub async fn list_returns(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<SaleReturn>, String> {
    let rows = sqlx::query(
        "SELECT r.id, r.return_number, r.sale_id, s.receipt_no,
                c.name AS customer_name,
                r.reason, r.refund_method, r.refund_amount, r.status, r.created_at
         FROM sale_returns r
         LEFT JOIN sales s ON s.id = r.sale_id
         LEFT JOIN customers c ON c.id = r.customer_id
         ORDER BY r.created_at DESC"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let rid: String = r.get("id");
        let items = sqlx::query(
            "SELECT ri.product_id, p.name AS product_name, p.sku, ri.quantity, ri.unit_price
             FROM sale_return_items ri
             LEFT JOIN products p ON p.id = ri.product_id
             WHERE ri.return_id = ?"
        ).bind(&rid).fetch_all(&*pool).await.unwrap_or_default()
         .into_iter().map(|ir| serde_json::json!({
            "product_id": ir.get::<String, _>("product_id"),
            "product_name": ir.get::<Option<String>, _>("product_name").unwrap_or_default(),
            "sku": ir.get::<Option<String>, _>("sku").unwrap_or_default(),
            "quantity": ir.get::<f64, _>("quantity"),
            "unit_price": ir.get::<f64, _>("unit_price"),
         })).collect::<Vec<_>>();

        out.push(SaleReturn {
            id: rid,
            return_number: r.get("return_number"),
            sale_id: r.get("sale_id"),
            receipt_no: r.get::<Option<String>, _>("receipt_no").unwrap_or_default(),
            customer_name: r.get("customer_name"),
            reason: r.get("reason"),
            refund_method: r.get("refund_method"),
            refund_amount: r.get("refund_amount"),
            status: r.get("status"),
            stock_disposition: r.get("stock_disposition"),
            created_at: r.get("created_at"),
            item_count: items.len() as i64,
            items,
        });
    }
    Ok(out)
}

#[tauri::command]
pub async fn approve_return(
    pool: tauri::State<'_, SqlitePool>,
    return_id: String,
) -> Result<(), String> {
    let row = sqlx::query(
        "SELECT status, sale_id, refund_method, stock_disposition FROM sale_returns WHERE id = ?"
    ).bind(&return_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
     .ok_or("Return not found")?;

    let status: String = row.get("status");
    if status != "pending" {
        return Err(format!("Cannot approve a {} return", status));
    }
    let disposition: String = row.get::<Option<String>, _>("stock_disposition").unwrap_or_else(|| "restock".into());

    let sale_id: String = row.get("sale_id");

    // Find warehouse from original sale
    let warehouse_id: Option<String> = sqlx::query_scalar(
        "SELECT warehouse_id FROM sales WHERE id = ?"
    ).bind(&sale_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?;
    let wid = warehouse_id.ok_or("Original sale has no warehouse")?;

    let items = sqlx::query(
        "SELECT product_id, quantity FROM sale_return_items WHERE return_id = ?"
    ).bind(&return_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    for it in items {
        let pid: String = it.get("product_id");
        let qty: f64 = it.get("quantity");

        if disposition == "restock" {
            let existing: Option<String> = sqlx::query_scalar(
                "SELECT id FROM inventory_stock WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
            ).bind(&pid).bind(&wid).fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?;

            if let Some(sid) = existing {
                sqlx::query("UPDATE inventory_stock SET quantity = quantity + ?, updated_at = ? WHERE id = ?")
                    .bind(qty).bind(now_iso()).bind(&sid)
                    .execute(&mut *tx).await.map_err(|e| e.to_string())?;
            } else {
                sqlx::query(
                    "INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, updated_at)
                     VALUES (?, ?, ?, ?, ?)"
                ).bind(new_id()).bind(&pid).bind(&wid).bind(qty).bind(now_iso())
                .execute(&mut *tx).await.map_err(|e| e.to_string())?;
            }

            sqlx::query(
                "INSERT INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity,
                 reference_table, reference_id, notes, created_at)
                 VALUES (?, ?, ?, 'sale_return', ?, 'sale_returns', ?, 'Returned to stock', ?)"
            ).bind(new_id()).bind(&pid).bind(&wid).bind(qty).bind(&return_id).bind(now_iso())
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        } else {
            sqlx::query(
                "INSERT INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity,
                 reference_table, reference_id, notes, created_at)
                 VALUES (?, ?, ?, 'adjustment', 0, 'sale_returns', ?, 'Write-off (unsellable return)', ?)"
            ).bind(new_id()).bind(&pid).bind(&wid).bind(&return_id).bind(now_iso())
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        }
    }

    sqlx::query("UPDATE sale_returns SET status = 'approved' WHERE id = ?")
        .bind(&return_id).execute(&mut *tx).await.map_err(|e| e.to_string())?;

    sqlx::query("UPDATE sales SET status = 'refunded' WHERE id = ?")
        .bind(&sale_id).execute(&mut *tx).await.map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn reject_return(
    pool: tauri::State<'_, SqlitePool>,
    return_id: String,
) -> Result<(), String> {
    sqlx::query("UPDATE sale_returns SET status = 'rejected' WHERE id = ? AND status = 'pending'")
        .bind(&return_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
