use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

#[derive(Serialize, Deserialize)]
pub struct Warehouse {
    pub id: String,
    pub name: String,
    pub location: Option<String>,
    pub manager: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub capacity: Option<String>,
    pub is_default: bool,
    pub status: String,
    pub created_at: String,
    pub product_count: i64,
    pub total_stock: f64,
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn create_warehouse(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    location: Option<String>,
    manager: Option<String>,
    phone: Option<String>,
    email: Option<String>,
    capacity: Option<String>,
    is_default: Option<bool>,
) -> Result<Warehouse, String> {
    let id = new_id();
    let default = is_default.unwrap_or(false);

    if default {
        sqlx::query("UPDATE warehouses SET is_default = 0").execute(&*pool).await.ok();
    }

    sqlx::query(
        "INSERT INTO warehouses
         (id, name, location, manager, phone, email, capacity, is_default, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)"
    )
    .bind(&id).bind(&name).bind(&location).bind(&manager).bind(&phone)
    .bind(&email).bind(&capacity).bind(if default { 1 } else { 0 }).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Warehouse {
        id, name, location, manager, phone, email, capacity,
        is_default: default, status: "active".into(),
        created_at: now_iso(), product_count: 0, total_stock: 0.0,
    })
}

#[tauri::command]
pub async fn list_warehouses(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<Warehouse>, String> {
    let rows = sqlx::query(
        "SELECT id, name, location, manager, phone, email, capacity,
                is_default, status, created_at
         FROM warehouses
         ORDER BY is_default DESC, name ASC"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let id: String = r.get("id");
        let (product_count, total_stock): (i64, f64) = sqlx::query_as(
            "SELECT COUNT(DISTINCT product_id), COALESCE(SUM(quantity), 0.0)
             FROM inventory_stock WHERE warehouse_id = ?"
        ).bind(&id).fetch_one(&*pool).await.unwrap_or((0, 0.0));

        out.push(Warehouse {
            id,
            name: r.get("name"),
            location: r.get("location"),
            manager: r.get("manager"),
            phone: r.get("phone"),
            email: r.get("email"),
            capacity: r.get("capacity"),
            is_default: r.get::<i64, _>("is_default") != 0,
            status: r.get("status"),
            created_at: r.get("created_at"),
            product_count,
            total_stock,
        });
    }
    Ok(out)
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn update_warehouse(
    pool: tauri::State<'_, SqlitePool>,
    warehouse_id: String,
    name: String,
    location: Option<String>,
    manager: Option<String>,
    phone: Option<String>,
    email: Option<String>,
    capacity: Option<String>,
    status: String,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE warehouses SET name = ?, location = ?, manager = ?, phone = ?,
            email = ?, capacity = ?, status = ? WHERE id = ?"
    )
    .bind(&name).bind(&location).bind(&manager).bind(&phone)
    .bind(&email).bind(&capacity).bind(&status).bind(&warehouse_id)
    .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn set_default_warehouse(
    pool: tauri::State<'_, SqlitePool>,
    warehouse_id: String,
) -> Result<(), String> {
    sqlx::query("UPDATE warehouses SET is_default = 0").execute(&*pool).await.ok();
    sqlx::query("UPDATE warehouses SET is_default = 1 WHERE id = ?")
        .bind(&warehouse_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_warehouse(
    pool: tauri::State<'_, SqlitePool>,
    warehouse_id: String,
) -> Result<(), String> {
    // Prevent deleting the last warehouse
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM warehouses")
        .fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if total <= 1 {
        return Err("Cannot delete the last warehouse".into());
    }

    // Prevent deleting if stock exists
    let stock: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM inventory_stock WHERE warehouse_id = ? AND quantity > 0"
    ).bind(&warehouse_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if stock > 0 {
        return Err("Cannot delete warehouse that still has stock".into());
    }

    sqlx::query("DELETE FROM warehouses WHERE id = ?")
        .bind(&warehouse_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Auto-seed default warehouse on first launch ----------
pub async fn ensure_default_warehouse(pool: &SqlitePool) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM warehouses")
        .fetch_one(pool).await.unwrap_or(0);
    if count > 0 { return; }

    // Use shop name if available, else "Main Store"
    let shop_name: Option<String> = sqlx::query_scalar(
        "SELECT shop_name FROM shop_config LIMIT 1"
    ).fetch_optional(pool).await.ok().flatten();

    let name = shop_name.unwrap_or_else(|| "Main Store".to_string());

    let _ = sqlx::query(
        "INSERT INTO warehouses (id, name, is_default, status, created_at)
         VALUES (?, ?, 1, 'active', ?)"
    )
    .bind(new_id()).bind(name).bind(now_iso())
    .execute(pool).await;
}


// ---------- Auto-seed store settings on first launch ----------
pub async fn ensure_store_settings(pool: &SqlitePool) {
    // Always ensure a single settings row exists.
    // INSERT OR IGNORE with fixed id makes this idempotent.
    let _ = sqlx::query(
        "INSERT OR IGNORE INTO store_settings
         (id, currency_code, currency_symbol, receipt_prefix, invoice_prefix,
          next_receipt_no, next_invoice_no, updated_at)
         VALUES ('store_settings_singleton', 'KES', 'KSH', 'RCP', 'INV', 1, 1, ?)"
    )
    .bind(now_iso())
    .execute(pool).await;
}
