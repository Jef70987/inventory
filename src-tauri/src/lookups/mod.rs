use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

// ---------- Categories ----------
#[derive(Serialize, Deserialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub product_count: i64,
}

#[tauri::command]
pub async fn create_category(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    parent_id: Option<String>,
    description: Option<String>,
) -> Result<Category, String> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO categories (id, name, parent_id, description, is_active, created_at)
         VALUES (?, ?, ?, ?, 1, ?)"
    )
    .bind(&id).bind(&name).bind(&parent_id).bind(&description).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Category {
        id, name, parent_id, description,
        is_active: true, created_at: now_iso(), product_count: 0,
    })
}

#[tauri::command]
pub async fn list_categories(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<Category>, String> {
    let rows = sqlx::query(
        "SELECT c.id, c.name, c.parent_id, c.description, c.is_active, c.created_at,
                (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
         FROM categories c
         ORDER BY c.name"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| Category {
        id: r.get("id"),
        name: r.get("name"),
        parent_id: r.get("parent_id"),
        description: r.get("description"),
        is_active: r.get::<i64, _>("is_active") != 0,
        created_at: r.get("created_at"),
        product_count: r.get("product_count"),
    }).collect())
}

#[tauri::command]
pub async fn delete_category(
    pool: tauri::State<'_, SqlitePool>,
    category_id: String,
) -> Result<(), String> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM products WHERE category_id = ?"
    ).bind(&category_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if count > 0 {
        return Err("Cannot delete category that has products".into());
    }
    sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(&category_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Brands ----------
#[derive(Serialize, Deserialize)]
pub struct Brand {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub product_count: i64,
}

#[tauri::command]
pub async fn create_brand(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    description: Option<String>,
) -> Result<Brand, String> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO brands (id, name, description, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&id).bind(&name).bind(&description).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Brand { id, name, description, created_at: now_iso(), product_count: 0 })
}

#[tauri::command]
pub async fn list_brands(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<Brand>, String> {
    let rows = sqlx::query(
        "SELECT b.id, b.name, b.description, b.created_at,
                (SELECT COUNT(*) FROM products WHERE brand_id = b.id) AS product_count
         FROM brands b
         ORDER BY b.name"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| Brand {
        id: r.get("id"),
        name: r.get("name"),
        description: r.get("description"),
        created_at: r.get("created_at"),
        product_count: r.get("product_count"),
    }).collect())
}

#[tauri::command]
pub async fn delete_brand(
    pool: tauri::State<'_, SqlitePool>,
    brand_id: String,
) -> Result<(), String> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM products WHERE brand_id = ?"
    ).bind(&brand_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if count > 0 {
        return Err("Cannot delete brand that has products".into());
    }
    sqlx::query("DELETE FROM brands WHERE id = ?")
        .bind(&brand_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Units of Measure ----------
#[derive(Serialize, Deserialize)]
pub struct Unit {
    pub id: String,
    pub code: String,
    pub name: String,
    pub created_at: String,
    pub product_count: i64,
}

#[tauri::command]
pub async fn create_unit(
    pool: tauri::State<'_, SqlitePool>,
    code: String,
    name: String,
) -> Result<Unit, String> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO units_of_measure (id, code, name, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&id).bind(&code).bind(&name).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Unit { id, code, name, created_at: now_iso(), product_count: 0 })
}

#[tauri::command]
pub async fn list_units(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<Unit>, String> {
    let rows = sqlx::query(
        "SELECT u.id, u.code, u.name, u.created_at,
                (SELECT COUNT(*) FROM products WHERE unit_id = u.id) AS product_count
         FROM units_of_measure u
         ORDER BY u.name"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| Unit {
        id: r.get("id"),
        code: r.get("code"),
        name: r.get("name"),
        created_at: r.get("created_at"),
        product_count: r.get("product_count"),
    }).collect())
}

#[tauri::command]
pub async fn delete_unit(
    pool: tauri::State<'_, SqlitePool>,
    unit_id: String,
) -> Result<(), String> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM products WHERE unit_id = ?"
    ).bind(&unit_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if count > 0 {
        return Err("Cannot delete unit that has products".into());
    }
    sqlx::query("DELETE FROM units_of_measure WHERE id = ?")
        .bind(&unit_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
