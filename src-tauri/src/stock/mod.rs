pub mod transfers;

use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

#[derive(Serialize)]
pub struct StockAdjustment {
    pub id: String,
    pub warehouse_id: String,
    pub warehouse_name: String,
    pub product_id: String,
    pub product_name: String,
    pub product_sku: String,
    pub direction: String,
    pub quantity: f64,
    pub reason: String,
    pub notes: Option<String>,
    pub adjusted_by: Option<String>,
    pub created_at: String,
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn adjust_stock(
    pool: tauri::State<'_, SqlitePool>,
    warehouse_id: String,
    product_id: String,
    direction: String,
    quantity: f64,
    reason: String,
    notes: Option<String>,
    user_id: Option<String>,
) -> Result<(), String> {
    if direction != "add" && direction != "remove" {
        return Err("direction must be add or remove".into());
    }
    if quantity <= 0.0 {
        return Err("quantity must be greater than zero".into());
    }

    // Ensure inventory_stock row exists
    let existing: Option<(String, f64)> = sqlx::query_as(
        "SELECT id, quantity FROM inventory_stock WHERE product_id = ? AND warehouse_id = ? AND variant_id IS NULL"
    ).bind(&product_id).bind(&warehouse_id)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

    let delta = if direction == "add" { quantity } else { -quantity };

    if let Some((row_id, current)) = existing {
        let new_qty = current + delta;
        if new_qty < 0.0 {
            return Err(format!("Not enough stock. Current: {}, trying to remove: {}", current, quantity));
        }
        sqlx::query("UPDATE inventory_stock SET quantity = ?, updated_at = ? WHERE id = ?")
            .bind(new_qty).bind(now_iso()).bind(&row_id)
            .execute(&*pool).await.map_err(|e| e.to_string())?;
    } else {
        if delta < 0.0 {
            return Err("No stock to remove for this product in this warehouse".into());
        }
        sqlx::query(
            "INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, updated_at)
             VALUES (?, ?, ?, ?, ?)"
        ).bind(new_id()).bind(&product_id).bind(&warehouse_id).bind(delta).bind(now_iso())
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    }

    // Record in stock_movements ledger
    sqlx::query(
        "INSERT INTO stock_movements
         (id, product_id, warehouse_id, movement_type, quantity, reference_table, notes, created_by, created_at)
         VALUES (?, ?, ?, 'adjustment', ?, 'stock_adjustments', ?, ?, ?)"
    )
    .bind(new_id())
    .bind(&product_id)
    .bind(&warehouse_id)
    .bind(if direction == "add" { quantity } else { -quantity })
    .bind(if notes.is_some() { notes.clone() } else { Some(reason.clone()) })
    .bind(&user_id)
    .bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn list_stock_adjustments(
    pool: tauri::State<'_, SqlitePool>,
    limit: Option<i64>,
) -> Result<Vec<StockAdjustment>, String> {
    let lim = limit.unwrap_or(100);
    let rows = sqlx::query(
        "SELECT m.id, m.warehouse_id, w.name AS warehouse_name,
                m.product_id, p.name AS product_name, p.sku AS product_sku,
                m.quantity, m.notes, m.created_by, m.created_at,
                u.username
         FROM stock_movements m
         LEFT JOIN warehouses w ON w.id = m.warehouse_id
         LEFT JOIN products p ON p.id = m.product_id
         LEFT JOIN users u ON u.id = m.created_by
         WHERE m.movement_type = 'adjustment'
         ORDER BY m.created_at DESC
         LIMIT ?"
    ).bind(lim).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| {
        let qty: f64 = r.get("quantity");
        StockAdjustment {
            id: r.get("id"),
            warehouse_id: r.get("warehouse_id"),
            warehouse_name: r.get::<Option<String>, _>("warehouse_name").unwrap_or_default(),
            product_id: r.get("product_id"),
            product_name: r.get::<Option<String>, _>("product_name").unwrap_or_default(),
            product_sku: r.get::<Option<String>, _>("product_sku").unwrap_or_default(),
            direction: if qty >= 0.0 { "add".into() } else { "remove".into() },
            quantity: qty.abs(),
            reason: r.get::<Option<String>, _>("notes").unwrap_or_default(),
            notes: r.get("notes"),
            adjusted_by: r.get::<Option<String>, _>("username"),
            created_at: r.get("created_at"),
        }
    }).collect())
}

#[tauri::command]
pub async fn get_stock_levels(
    pool: tauri::State<'_, SqlitePool>,
    warehouse_id: Option<String>,
) -> Result<Vec<serde_json::Value>, String> {
    let rows = if let Some(wid) = warehouse_id {
        sqlx::query(
            "SELECT s.product_id, p.name AS product_name, p.sku, s.warehouse_id,
                    w.name AS warehouse_name, s.quantity, p.reorder_level
             FROM inventory_stock s
             JOIN products p ON p.id = s.product_id
             JOIN warehouses w ON w.id = s.warehouse_id
             WHERE s.warehouse_id = ?
             ORDER BY p.name"
        ).bind(&wid).fetch_all(&*pool).await
    } else {
        sqlx::query(
            "SELECT s.product_id, p.name AS product_name, p.sku, s.warehouse_id,
                    w.name AS warehouse_name, s.quantity, p.reorder_level
             FROM inventory_stock s
             JOIN products p ON p.id = s.product_id
             JOIN warehouses w ON w.id = s.warehouse_id
             ORDER BY p.name"
        ).fetch_all(&*pool).await
    }.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| serde_json::json!({
        "product_id": r.get::<String, _>("product_id"),
        "product_name": r.get::<String, _>("product_name"),
        "sku": r.get::<String, _>("sku"),
        "warehouse_id": r.get::<String, _>("warehouse_id"),
        "warehouse_name": r.get::<String, _>("warehouse_name"),
        "quantity": r.get::<f64, _>("quantity"),
        "reorder_level": r.get::<i64, _>("reorder_level"),
    })).collect())
}
