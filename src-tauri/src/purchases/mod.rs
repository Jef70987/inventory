use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

fn format_po(n: i64) -> String {
    let year = chrono::Utc::now().format("%Y").to_string();
    format!("PO-{}-{:04}", year, n)
}

#[derive(Serialize, Deserialize)]
pub struct POItemInput {
    pub product_id: String,
    pub quantity: f64,
    pub unit_cost: f64,
}

#[derive(Serialize)]
pub struct PurchaseOrder {
    pub id: String,
    pub po_number: String,
    pub supplier_id: String,
    pub supplier_name: Option<String>,
    pub status: String,
    pub order_date: String,
    pub expected_date: Option<String>,
    pub notes: Option<String>,
    pub total: f64,
    pub item_count: i64,
    pub created_at: String,
    pub items: Vec<POItemRow>,
}

#[derive(Serialize)]
pub struct POItemRow {
    pub id: String,
    pub product_id: String,
    pub product_name: String,
    pub product_sku: String,
    pub quantity: f64,
    pub unit_cost: f64,
    pub received_qty: f64,
    pub line_total: f64,
}

#[tauri::command]
pub async fn create_purchase_order(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
    expected_date: Option<String>,
    notes: Option<String>,
    user_id: Option<String>,
    items: Vec<POItemInput>,
) -> Result<String, String> {
    if items.is_empty() {
        return Err("Purchase order must have at least one item".into());
    }

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM purchase_orders")
        .fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    let po_number = format_po(count + 1);

    let po_id = new_id();
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO purchase_orders
         (id, po_number, supplier_id, status, order_date, expected_date, notes, created_by, created_at)
         VALUES (?, ?, ?, 'pending', date('now'), ?, ?, ?, ?)"
    )
    .bind(&po_id).bind(&po_number).bind(&supplier_id)
    .bind(&expected_date).bind(&notes).bind(&user_id).bind(now_iso())
    .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &items {
        if it.quantity <= 0.0 {
            return Err("Item quantity must be greater than zero".into());
        }
        sqlx::query(
            "INSERT INTO purchase_order_items
             (id, po_id, product_id, variant_id, quantity, unit_cost, received_qty)
             VALUES (?, ?, ?, NULL, ?, ?, 0)"
        )
        .bind(new_id()).bind(&po_id).bind(&it.product_id)
        .bind(it.quantity).bind(it.unit_cost)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(po_id)
}

#[tauri::command]
pub async fn list_purchase_orders(
    pool: tauri::State<'_, SqlitePool>,
    search: Option<String>,
) -> Result<Vec<PurchaseOrder>, String> {
    let like = search.map(|s| format!("%{}%", s)).unwrap_or_else(|| "%".to_string());

    let rows = sqlx::query(
        "SELECT po.id, po.po_number, po.supplier_id, s.name AS supplier_name,
                po.status, po.order_date, po.expected_date, po.notes, po.created_at,
                COALESCE((SELECT SUM(quantity * unit_cost) FROM purchase_order_items WHERE po_id = po.id), 0.0) AS total,
                (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) AS item_count
         FROM purchase_orders po
         LEFT JOIN suppliers s ON s.id = po.supplier_id
         WHERE po.po_number LIKE ? OR s.name LIKE ?
         ORDER BY po.created_at DESC"
    )
    .bind(&like).bind(&like)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let pid: String = r.get("id");
        let items = load_items(&pool, &pid).await;
        out.push(PurchaseOrder {
            id: pid,
            po_number: r.get("po_number"),
            supplier_id: r.get("supplier_id"),
            supplier_name: r.get("supplier_name"),
            status: r.get("status"),
            order_date: r.get("order_date"),
            expected_date: r.get("expected_date"),
            notes: r.get("notes"),
            total: r.get("total"),
            item_count: r.get("item_count"),
            created_at: r.get("created_at"),
            items,
        });
    }
    Ok(out)
}

async fn load_items(pool: &SqlitePool, po_id: &str) -> Vec<POItemRow> {
    let rows = sqlx::query(
        "SELECT poi.id, poi.product_id, p.name AS product_name, p.sku,
                poi.quantity, poi.unit_cost, poi.received_qty
         FROM purchase_order_items poi
         LEFT JOIN products p ON p.id = poi.product_id
         WHERE poi.po_id = ?"
    ).bind(po_id).fetch_all(pool).await.unwrap_or_default();

    rows.into_iter().map(|r| {
        let q: f64 = r.get("quantity");
        let c: f64 = r.get("unit_cost");
        POItemRow {
            id: r.get("id"),
            product_id: r.get("product_id"),
            product_name: r.get::<Option<String>, _>("product_name").unwrap_or_default(),
            product_sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
            quantity: q,
            unit_cost: c,
            received_qty: r.get("received_qty"),
            line_total: q * c,
        }
    }).collect()
}

#[tauri::command]
pub async fn get_purchase_order(
    pool: tauri::State<'_, SqlitePool>,
    po_id: String,
) -> Result<PurchaseOrder, String> {
    let r = sqlx::query(
        "SELECT po.id, po.po_number, po.supplier_id, s.name AS supplier_name,
                po.status, po.order_date, po.expected_date, po.notes, po.created_at,
                COALESCE((SELECT SUM(quantity * unit_cost) FROM purchase_order_items WHERE po_id = po.id), 0.0) AS total,
                (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) AS item_count
         FROM purchase_orders po
         LEFT JOIN suppliers s ON s.id = po.supplier_id
         WHERE po.id = ?"
    ).bind(&po_id)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Purchase order not found")?;

    let items = load_items(&pool, &po_id).await;

    Ok(PurchaseOrder {
        id: r.get("id"),
        po_number: r.get("po_number"),
        supplier_id: r.get("supplier_id"),
        supplier_name: r.get("supplier_name"),
        status: r.get("status"),
        order_date: r.get("order_date"),
        expected_date: r.get("expected_date"),
        notes: r.get("notes"),
        total: r.get("total"),
        item_count: r.get("item_count"),
        created_at: r.get("created_at"),
        items,
    })
}

#[tauri::command]
pub async fn update_po_status(
    pool: tauri::State<'_, SqlitePool>,
    po_id: String,
    status: String,
) -> Result<(), String> {
    let allowed = ["pending", "approved", "shipped", "received", "cancelled"];
    if !allowed.contains(&status.as_str()) {
        return Err("Invalid status".into());
    }
    sqlx::query("UPDATE purchase_orders SET status = ? WHERE id = ?")
        .bind(&status).bind(&po_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_purchase_order(
    pool: tauri::State<'_, SqlitePool>,
    po_id: String,
) -> Result<(), String> {
    let status: String = sqlx::query_scalar(
        "SELECT status FROM purchase_orders WHERE id = ?"
    ).bind(&po_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if status == "received" {
        return Err("Cannot delete a received purchase order".into());
    }

    sqlx::query("DELETE FROM purchase_order_items WHERE po_id = ?")
        .bind(&po_id).execute(&*pool).await.ok();
    sqlx::query("DELETE FROM purchase_orders WHERE id = ?")
        .bind(&po_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Deserialize)]
pub struct ReceiveItem {
    pub item_id: String,
    pub received_qty: f64,
}

#[tauri::command]
pub async fn receive_purchase_order(
    pool: tauri::State<'_, SqlitePool>,
    po_id: String,
    warehouse_id: String,
    user_id: Option<String>,
    receive_items: Vec<ReceiveItem>,
) -> Result<(), String> {
    let po = sqlx::query(
        "SELECT id, po_number, status FROM purchase_orders WHERE id = ?"
    ).bind(&po_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
     .ok_or("Purchase order not found")?;

    let status: String = po.get("status");
    if status == "received" {
        return Err("Purchase order already fully received".into());
    }
    if status == "cancelled" {
        return Err("Cannot receive a cancelled purchase order".into());
    }

    let po_number: String = po.get("po_number");
    let grn_number = format!("GRN-{}", po_number.replace("PO-", ""));

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let grn_id = new_id();
    sqlx::query(
        "INSERT INTO goods_received_notes (id, grn_number, po_id, warehouse_id, received_by, received_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(&grn_id).bind(&grn_number).bind(&po_id).bind(&warehouse_id)
     .bind(&user_id).bind(now_iso())
     .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &receive_items {
        if it.received_qty <= 0.0 { continue; }

        let row = sqlx::query(
            "SELECT product_id, quantity, unit_cost, received_qty FROM purchase_order_items WHERE id = ?"
        ).bind(&it.item_id).fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?
         .ok_or("PO item not found")?;

        let product_id: String = row.get("product_id");
        let ordered: f64 = row.get("quantity");
        let unit_cost: f64 = row.get("unit_cost");
        let already: f64 = row.get("received_qty");
        let new_total = already + it.received_qty;

        if new_total > ordered + 0.001 {
            return Err(format!("Cannot receive more than ordered for item {}", product_id));
        }

        sqlx::query("UPDATE purchase_order_items SET received_qty = ? WHERE id = ?")
            .bind(new_total).bind(&it.item_id)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;

        sqlx::query(
            "INSERT INTO goods_received_items (id, grn_id, product_id, variant_id, quantity, unit_cost)
             VALUES (?, ?, ?, NULL, ?, ?)"
        ).bind(new_id()).bind(&grn_id).bind(&product_id)
         .bind(it.received_qty).bind(unit_cost)
         .execute(&mut *tx).await.map_err(|e| e.to_string())?;

        let existing: Option<String> = sqlx::query_scalar(
            "SELECT id FROM inventory_stock WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
        ).bind(&product_id).bind(&warehouse_id).fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?;

        if let Some(sid) = existing {
            sqlx::query("UPDATE inventory_stock SET quantity = quantity + ?, updated_at = ? WHERE id = ?")
                .bind(it.received_qty).bind(now_iso()).bind(&sid)
                .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        } else {
            sqlx::query(
                "INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, updated_at)
                 VALUES (?, ?, ?, ?, ?)"
            ).bind(new_id()).bind(&product_id).bind(&warehouse_id)
             .bind(it.received_qty).bind(now_iso())
             .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        }

        sqlx::query(
            "INSERT INTO stock_movements
             (id, product_id, warehouse_id, movement_type, quantity, unit_cost,
              reference_table, reference_id, created_by, created_at)
             VALUES (?, ?, ?, 'purchase', ?, ?, 'purchase_orders', ?, ?, ?)"
        ).bind(new_id()).bind(&product_id).bind(&warehouse_id)
         .bind(it.received_qty).bind(unit_cost)
         .bind(&po_id).bind(&user_id).bind(now_iso())
         .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    let remaining: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM purchase_order_items WHERE po_id = ? AND received_qty < quantity - 0.001"
    ).bind(&po_id).fetch_one(&mut *tx).await.map_err(|e| e.to_string())?;

    let new_status = if remaining == 0 { "received" } else { "shipped" };
    sqlx::query("UPDATE purchase_orders SET status = ? WHERE id = ?")
        .bind(new_status).bind(&po_id)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}
