use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct ShopConfig {
    pub id: String,
    pub shop_name: String,
    pub shop_type: Option<String>,
    pub location: Option<String>,
    pub owner_name: Option<String>,
    pub owner_phone: Option<String>,
    pub owner_email: Option<String>,
}

#[tauri::command]
pub async fn save_shop_config(
    pool: tauri::State<'_, SqlitePool>,
    shop_name: String,
    shop_type: Option<String>,
    location: Option<String>,
    owner_name: Option<String>,
    owner_phone: Option<String>,
    owner_email: Option<String>,
) -> Result<ShopConfig, String> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO shop_config (id, shop_name, shop_type, location, owner_name, owner_phone, owner_email)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&shop_name).bind(&shop_type).bind(&location)
    .bind(&owner_name).bind(&owner_phone).bind(&owner_email)
    .execute(&*pool).await
    .map_err(|e| e.to_string())?;

    Ok(ShopConfig {
        id, shop_name, shop_type, location, owner_name, owner_phone, owner_email,
    })
}

#[tauri::command]
pub async fn get_shop_config(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Option<ShopConfig>, String> {
    let row = sqlx::query(
        "SELECT id, shop_name, shop_type, location, owner_name, owner_phone, owner_email
         FROM shop_config LIMIT 1"
    )
    .fetch_optional(&*pool).await
    .map_err(|e| e.to_string())?;

    Ok(row.map(|r| ShopConfig {
        id: r.get("id"),
        shop_name: r.get("shop_name"),
        shop_type: r.get("shop_type"),
        location: r.get("location"),
        owner_name: r.get("owner_name"),
        owner_phone: r.get("owner_phone"),
        owner_email: r.get("owner_email"),
    }))
}

#[tauri::command]
pub async fn check_setup_complete(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<bool, String> {
    let shop_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM shop_config")
        .fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    let user_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    Ok(shop_count > 0 && user_count > 0)
}
