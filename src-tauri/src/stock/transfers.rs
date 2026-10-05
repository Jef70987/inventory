use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

#[derive(Serialize, Deserialize)]
pub struct Transfer {
    pub id: String,
    pub from_warehouse_id: String,
    pub from_warehouse_name: String,
    pub to_warehouse_id: String,
    pub to_warehouse_name: String,
    pub status: String,
    pub transferred_by: Option<String>,
    pub transferred_by_name: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
    pub completed_at: Option<String>,
    pub item_count: i64,
    pub total_quantity: f64,
    pub items: Vec<TransferItem>,
}

#[derive(Serialize, Deserialize)]
pub struct TransferItem {
    pub id: String,
    pub product_id: String,
    pub product_name: String,
    pub product_sku: String,
    pub quantity: f64,
}

#[tauri::command]
pub async fn create_transfer(
    pool: tauri::State<'_, SqlitePool>,
    from_warehouse_id: String,
    to_warehouse_id: String,
    notes: Option<String>,
    user_id: Option<String>,
    items: Vec<serde_json::Value>,
) -> Result<String, String> {
    if from_warehouse_id == to_warehouse_id {
        return Err("Source and destination warehouses must be different".into());
    }
    if items.is_empty() {
        return Err("Transfer must have at least one item".into());
    }

    let transfer_id = new_id();

    sqlx::query(
        "INSERT INTO stock_transfers (id, from_warehouse, to_warehouse, status, transferred_by, notes, created_at)
         VALUES (?, ?, ?, 'pending', ?, ?, ?)"
    )
    .bind(&transfer_id).bind(&from_warehouse_id).bind(&to_warehouse_id)
    .bind(&user_id).bind(&notes).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    for item in items {
        let product_id = item["product_id"].as_str().ok_or("Missing product_id")?.to_string();
        let quantity = item["quantity"].as_f64().ok_or("Missing quantity")?;
        if quantity <= 0.0 {
            return Err("Quantity must be greater than zero".into());
        }

        sqlx::query(
            "INSERT INTO stock_transfer_items (id, transfer_id, product_id, quantity)
             VALUES (?, ?, ?, ?)"
        )
        .bind(new_id()).bind(&transfer_id).bind(&product_id).bind(quantity)
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    }

    Ok(transfer_id)
}

#[tauri::command]
pub async fn list_transfers(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<Transfer>, String> {
    let rows = sqlx::query(
        "SELECT t.id, t.from_warehouse, wf.name AS from_name,
                t.to_warehouse, wt.name AS to_name,
                t.status, t.transferred_by, u.username,
                t.notes, t.created_at, t.completed_at
         FROM stock_transfers t
         LEFT JOIN warehouses wf ON wf.id = t.from_warehouse
         LEFT JOIN warehouses wt ON wt.id = t.to_warehouse
         LEFT JOIN users u ON u.id = t.transferred_by
         ORDER BY t.created_at DESC"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut transfers: Vec<Transfer> = Vec::new();
    for r in rows {
        let id: String = r.get("id");

        let item_rows = sqlx::query(
            "SELECT i.id, i.product_id, p.name AS product_name, p.sku, i.quantity
             FROM stock_transfer_items i
             LEFT JOIN products p ON p.id = i.product_id
             WHERE i.transfer_id = ?"
        ).bind(&id).fetch_all(&*pool).await.unwrap_or_default();

        let items: Vec<TransferItem> = item_rows.into_iter().map(|ir| TransferItem {
            id: ir.get("id"),
            product_id: ir.get("product_id"),
            product_name: ir.get::<Option<String>, _>("product_name").unwrap_or_default(),
            product_sku: ir.get::<Option<String>, _>("sku").unwrap_or_default(),
            quantity: ir.get("quantity"),
        }).collect();

        let total_quantity: f64 = items.iter().map(|x| x.quantity).sum();

        transfers.push(Transfer {
            id,
            from_warehouse_id: r.get("from_warehouse"),
            from_warehouse_name: r.get::<Option<String>, _>("from_name").unwrap_or_default(),
            to_warehouse_id: r.get("to_warehouse"),
            to_warehouse_name: r.get::<Option<String>, _>("to_name").unwrap_or_default(),
            status: r.get("status"),
            transferred_by: r.get("transferred_by"),
            transferred_by_name: r.get("username"),
            notes: r.get("notes"),
            created_at: r.get("created_at"),
            completed_at: r.get("completed_at"),
            item_count: items.len() as i64,
            total_quantity,
            items,
        });
    }
    Ok(transfers)
}

#[tauri::command]
pub async fn complete_transfer(
    pool: tauri::State<'_, SqlitePool>,
    transfer_id: String,
) -> Result<(), String> {
    // Load transfer
    let row = sqlx::query(
        "SELECT from_warehouse, to_warehouse, status FROM stock_transfers WHERE id = ?"
    ).bind(&transfer_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Transfer not found")?;

    let status: String = row.get("status");
    if status == "completed" { return Err("Transfer already completed".into()); }
    if status == "cancelled" { return Err("Transfer was cancelled".into()); }

    let from_id: String = row.get("from_warehouse");
    let to_id: String = row.get("to_warehouse");

    // Load items
    let items = sqlx::query(
        "SELECT product_id, quantity FROM stock_transfer_items WHERE transfer_id = ?"
    ).bind(&transfer_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    for it in items {
        let product_id: String = it.get("product_id");
        let qty: f64 = it.get("quantity");

        // Check source stock
        let src: Option<f64> = sqlx::query_scalar(
            "SELECT quantity FROM inventory_stock
             WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
        ).bind(&product_id).bind(&from_id)
        .fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

        let current = src.unwrap_or(0.0);
        if current < qty {
            return Err(format!("Not enough stock for product {}. Available: {}, needed: {}", product_id, current, qty));
        }

        // Deduct from source
        sqlx::query(
            "UPDATE inventory_stock SET quantity = quantity - ?, updated_at = ?
             WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
        ).bind(qty).bind(now_iso()).bind(&product_id).bind(&from_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;

        // Add to destination (upsert)
        let dest: Option<String> = sqlx::query_scalar(
            "SELECT id FROM inventory_stock
             WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
        ).bind(&product_id).bind(&to_id)
        .fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

        if let Some(dest_id) = dest {
            sqlx::query("UPDATE inventory_stock SET quantity = quantity + ?, updated_at = ? WHERE id = ?")
                .bind(qty).bind(now_iso()).bind(&dest_id)
                .execute(&*pool).await.map_err(|e| e.to_string())?;
        } else {
            sqlx::query(
                "INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, updated_at)
                 VALUES (?, ?, ?, ?, ?)"
            ).bind(new_id()).bind(&product_id).bind(&to_id).bind(qty).bind(now_iso())
            .execute(&*pool).await.map_err(|e| e.to_string())?;
        }

        // Ledger
        sqlx::query(
            "INSERT INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity,
             reference_table, reference_id, created_at)
             VALUES (?, ?, ?, 'transfer_out', ?, 'stock_transfers', ?, ?)"
        ).bind(new_id()).bind(&product_id).bind(&from_id).bind(-qty).bind(&transfer_id).bind(now_iso())
        .execute(&*pool).await.map_err(|e| e.to_string())?;

        sqlx::query(
            "INSERT INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity,
             reference_table, reference_id, created_at)
             VALUES (?, ?, ?, 'transfer_in', ?, 'stock_transfers', ?, ?)"
        ).bind(new_id()).bind(&product_id).bind(&to_id).bind(qty).bind(&transfer_id).bind(now_iso())
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    }

    sqlx::query("UPDATE stock_transfers SET status = 'completed', completed_at = ? WHERE id = ?")
        .bind(now_iso()).bind(&transfer_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn cancel_transfer(
    pool: tauri::State<'_, SqlitePool>,
    transfer_id: String,
) -> Result<(), String> {
    let status: String = sqlx::query_scalar(
        "SELECT status FROM stock_transfers WHERE id = ?"
    ).bind(&transfer_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if status == "completed" {
        return Err("Cannot cancel a completed transfer".into());
    }

    sqlx::query("UPDATE stock_transfers SET status = 'cancelled' WHERE id = ?")
        .bind(&transfer_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_transfer(
    pool: tauri::State<'_, SqlitePool>,
    transfer_id: String,
) -> Result<(), String> {
    let status: String = sqlx::query_scalar(
        "SELECT status FROM stock_transfers WHERE id = ?"
    ).bind(&transfer_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if status == "completed" {
        return Err("Cannot delete a completed transfer".into());
    }

    sqlx::query("DELETE FROM stock_transfer_items WHERE transfer_id = ?")
        .bind(&transfer_id).execute(&*pool).await.ok();
    sqlx::query("DELETE FROM stock_transfers WHERE id = ?")
        .bind(&transfer_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
