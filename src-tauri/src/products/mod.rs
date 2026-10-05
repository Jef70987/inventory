use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }

#[derive(Serialize, Deserialize)]
pub struct WarehouseStock {
    pub warehouse_id: String,
    pub warehouse_name: String,
    pub quantity: f64,
}

#[derive(Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub sku: String,
    pub barcode: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub brand_id: Option<String>,
    pub brand_name: Option<String>,
    pub unit_id: Option<String>,
    pub unit_code: Option<String>,
    pub cost_price: f64,
    pub sell_price: f64,
    pub reorder_level: i64,
    pub shelf_location: Option<String>,
    pub weight_kg: Option<f64>,
    pub dimensions: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub total_stock: f64,
    pub warehouses: Vec<WarehouseStock>,
}

async fn fetch_warehouses(pool: &SqlitePool, product_id: &str) -> Vec<WarehouseStock> {
    let rows = sqlx::query(
        "SELECT s.warehouse_id, w.name AS warehouse_name, s.quantity
         FROM inventory_stock s
         JOIN warehouses w ON w.id = s.warehouse_id
         WHERE s.product_id = ? AND s.quantity > 0
         ORDER BY w.name"
    ).bind(product_id).fetch_all(pool).await.unwrap_or_default();

    rows.into_iter().map(|r| WarehouseStock {
        warehouse_id: r.get("warehouse_id"),
        warehouse_name: r.get("warehouse_name"),
        quantity: r.get("quantity"),
    }).collect()
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn create_product(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    sku: String,
    barcode: Option<String>,
    description: Option<String>,
    category_id: Option<String>,
    brand_id: Option<String>,
    unit_id: Option<String>,
    cost_price: f64,
    sell_price: f64,
    reorder_level: i64,
    shelf_location: Option<String>,
    weight_kg: Option<f64>,
    dimensions: Option<String>,
) -> Result<Product, String> {
    let id = new_id();
    let sku_upper = sku.trim().to_uppercase();

    sqlx::query(
        "INSERT INTO products
         (id, sku, barcode, name, description, category_id, brand_id, unit_id,
          cost_price, sell_price, reorder_level, shelf_location, weight_kg, dimensions,
          is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)"
    )
    .bind(&id).bind(&sku_upper).bind(&barcode).bind(&name).bind(&description)
    .bind(&category_id).bind(&brand_id).bind(&unit_id)
    .bind(cost_price).bind(sell_price).bind(reorder_level)
    .bind(&shelf_location).bind(weight_kg).bind(&dimensions)
    .bind(now_iso()).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Product {
        id, sku: sku_upper, barcode, name, description,
        category_id, category_name: None,
        brand_id, brand_name: None,
        unit_id, unit_code: None,
        cost_price, sell_price, reorder_level,
        shelf_location, weight_kg, dimensions,
        is_active: true, created_at: now_iso(), total_stock: 0.0,
        warehouses: Vec::new(),
    })
}

#[tauri::command]
pub async fn list_products(
    pool: tauri::State<'_, SqlitePool>,
    search: Option<String>,
    category_id: Option<String>,
    only_active: Option<bool>,
) -> Result<Vec<Product>, String> {
    let like = search.map(|s| format!("%{}%", s)).unwrap_or_else(|| "%".to_string());
    let active_filter = if only_active.unwrap_or(false) { "AND p.is_active = 1" } else { "" };
    let cat_filter = if category_id.is_some() { "AND p.category_id = ?" } else { "" };

    let sql = format!(
        "SELECT p.id, p.sku, p.barcode, p.name, p.description,
                p.category_id, c.name AS category_name,
                p.brand_id, b.name AS brand_name,
                p.unit_id, u.code AS unit_code,
                p.cost_price, p.sell_price, p.reorder_level,
                p.shelf_location, p.weight_kg, p.dimensions,
                p.is_active, p.created_at,
                COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) AS total_stock
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN units_of_measure u ON u.id = p.unit_id
         WHERE (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)
         {cat_filter}
         {active_filter}
         ORDER BY p.created_at DESC"
    );

    let mut q = sqlx::query(&sql).bind(&like).bind(&like).bind(&like);
    if let Some(cid) = &category_id { q = q.bind(cid); }

    let rows = q.fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out: Vec<Product> = Vec::new();
    for r in rows {
        let pid: String = r.get("id");
        let warehouses = fetch_warehouses(&pool, &pid).await;
        out.push(Product {
            id: pid,
            sku: r.get("sku"),
            barcode: r.get("barcode"),
            name: r.get("name"),
            description: r.get("description"),
            category_id: r.get("category_id"),
            category_name: r.get("category_name"),
            brand_id: r.get("brand_id"),
            brand_name: r.get("brand_name"),
            unit_id: r.get("unit_id"),
            unit_code: r.get("unit_code"),
            cost_price: r.get("cost_price"),
            sell_price: r.get("sell_price"),
            reorder_level: r.get("reorder_level"),
            shelf_location: r.get("shelf_location"),
            weight_kg: r.get("weight_kg"),
            dimensions: r.get("dimensions"),
            is_active: r.get::<i64, _>("is_active") != 0,
            created_at: r.get("created_at"),
            total_stock: r.get("total_stock"),
            warehouses,
        });
    }
    Ok(out)
}

#[tauri::command]
pub async fn get_product(
    pool: tauri::State<'_, SqlitePool>,
    product_id: String,
) -> Result<Product, String> {
    let r = sqlx::query(
        "SELECT p.id, p.sku, p.barcode, p.name, p.description,
                p.category_id, c.name AS category_name,
                p.brand_id, b.name AS brand_name,
                p.unit_id, u.code AS unit_code,
                p.cost_price, p.sell_price, p.reorder_level,
                p.shelf_location, p.weight_kg, p.dimensions,
                p.is_active, p.created_at,
                COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) AS total_stock
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN units_of_measure u ON u.id = p.unit_id
         WHERE p.id = ?"
    ).bind(&product_id)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Product not found")?;

    let warehouses = fetch_warehouses(&pool, &product_id).await;

    Ok(Product {
        id: r.get("id"),
        sku: r.get("sku"),
        barcode: r.get("barcode"),
        name: r.get("name"),
        description: r.get("description"),
        category_id: r.get("category_id"),
        category_name: r.get("category_name"),
        brand_id: r.get("brand_id"),
        brand_name: r.get("brand_name"),
        unit_id: r.get("unit_id"),
        unit_code: r.get("unit_code"),
        cost_price: r.get("cost_price"),
        sell_price: r.get("sell_price"),
        reorder_level: r.get("reorder_level"),
        shelf_location: r.get("shelf_location"),
        weight_kg: r.get("weight_kg"),
        dimensions: r.get("dimensions"),
        is_active: r.get::<i64, _>("is_active") != 0,
        created_at: r.get("created_at"),
        total_stock: r.get("total_stock"),
        warehouses,
    })
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn update_product(
    pool: tauri::State<'_, SqlitePool>,
    product_id: String,
    name: String,
    sku: String,
    barcode: Option<String>,
    description: Option<String>,
    category_id: Option<String>,
    brand_id: Option<String>,
    unit_id: Option<String>,
    cost_price: f64,
    sell_price: f64,
    reorder_level: i64,
    shelf_location: Option<String>,
    weight_kg: Option<f64>,
    dimensions: Option<String>,
    is_active: bool,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE products SET
            name = ?, sku = ?, barcode = ?, description = ?,
            category_id = ?, brand_id = ?, unit_id = ?,
            cost_price = ?, sell_price = ?, reorder_level = ?,
            shelf_location = ?, weight_kg = ?, dimensions = ?,
            is_active = ?, updated_at = ?
         WHERE id = ?"
    )
    .bind(&name).bind(&sku.trim().to_uppercase()).bind(&barcode).bind(&description)
    .bind(&category_id).bind(&brand_id).bind(&unit_id)
    .bind(cost_price).bind(sell_price).bind(reorder_level)
    .bind(&shelf_location).bind(weight_kg).bind(&dimensions)
    .bind(if is_active { 1 } else { 0 })
    .bind(now_iso())
    .bind(&product_id)
    .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_product(
    pool: tauri::State<'_, SqlitePool>,
    product_id: String,
) -> Result<(), String> {
    let sold: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sale_items WHERE product_id = ?"
    ).bind(&product_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if sold > 0 {
        return Err("Cannot delete product that has sales history. Mark it inactive instead.".into());
    }
    sqlx::query("DELETE FROM products WHERE id = ?")
        .bind(&product_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
