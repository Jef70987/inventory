use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

#[derive(Serialize, Deserialize)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip_code: Option<String>,
    pub country: Option<String>,
    pub status: String,
    pub notes: Option<String>,
    pub joined_at: String,
    pub last_purchase_at: Option<String>,
    pub groups: Vec<String>,
    pub total_orders: i64,
    pub total_purchases: f64,
}

#[derive(Serialize, Deserialize)]
pub struct CustomerGroup {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub discount_pct: f64,
}

#[tauri::command]
pub async fn create_customer(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    email: Option<String>,
    phone: Option<String>,
    address: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip_code: Option<String>,
    country: Option<String>,
    status: Option<String>,
    notes: Option<String>,
    group_ids: Option<Vec<String>>,
) -> Result<Customer, String> {
    let id = new_id();
    let status = status.unwrap_or_else(|| "active".to_string());

    sqlx::query(
        "INSERT INTO customers (id, name, email, phone, address, city, state, zip_code, country, status, notes, joined_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id).bind(&name).bind(&email).bind(&phone)
    .bind(&address).bind(&city).bind(&state).bind(&zip_code)
    .bind(&country).bind(&status).bind(&notes).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    if let Some(gids) = &group_ids {
        for gid in gids {
            sqlx::query("INSERT INTO customer_group_members (customer_id, group_id) VALUES (?, ?)")
                .bind(&id).bind(gid)
                .execute(&*pool).await.map_err(|e| e.to_string())?;
        }
    }

    Ok(Customer {
        id, name, email, phone, address, city, state, zip_code, country,
        status, notes, joined_at: now_iso(),
        last_purchase_at: None,
        groups: group_ids.unwrap_or_default(),
        total_orders: 0,
        total_purchases: 0.0,
    })
}

#[tauri::command]
pub async fn list_customers(
    pool: tauri::State<'_, SqlitePool>,
    search: Option<String>,
) -> Result<Vec<Customer>, String> {
    let like = search.map(|s| format!("%{}%", s)).unwrap_or_else(|| "%".to_string());

    let rows = sqlx::query(
        "SELECT id, name, email, phone, address, city, state, zip_code, country,
                status, notes, joined_at, last_purchase_at
         FROM customers
         WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
         ORDER BY joined_at DESC"
    )
    .bind(&like).bind(&like).bind(&like)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut customers: Vec<Customer> = Vec::new();

    for r in rows {
        let id: String = r.get("id");

        let groups: Vec<String> = sqlx::query_scalar(
            "SELECT g.name FROM customer_groups g
             JOIN customer_group_members m ON m.group_id = g.id
             WHERE m.customer_id = ?"
        ).bind(&id).fetch_all(&*pool).await.unwrap_or_default();

        let (total_orders, total_purchases): (i64, f64) = sqlx::query_as(
            "SELECT COUNT(*), COALESCE(SUM(total), 0.0)
             FROM sales WHERE customer_id = ? AND status != 'void'"
        ).bind(&id).fetch_one(&*pool).await.unwrap_or((0, 0.0));

        customers.push(Customer {
            id,
            name: r.get("name"),
            email: r.get("email"),
            phone: r.get("phone"),
            address: r.get("address"),
            city: r.get("city"),
            state: r.get("state"),
            zip_code: r.get("zip_code"),
            country: r.get("country"),
            status: r.get("status"),
            notes: r.get("notes"),
            joined_at: r.get("joined_at"),
            last_purchase_at: r.get("last_purchase_at"),
            groups,
            total_orders,
            total_purchases,
        });
    }

    Ok(customers)
}

#[tauri::command]
pub async fn get_customer(
    pool: tauri::State<'_, SqlitePool>,
    customer_id: String,
) -> Result<Customer, String> {
    let r = sqlx::query(
        "SELECT id, name, email, phone, address, city, state, zip_code, country,
                status, notes, joined_at, last_purchase_at
         FROM customers WHERE id = ?"
    )
    .bind(&customer_id)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Customer not found")?;

    let groups: Vec<String> = sqlx::query_scalar(
        "SELECT g.name FROM customer_groups g
         JOIN customer_group_members m ON m.group_id = g.id
         WHERE m.customer_id = ?"
    ).bind(&customer_id).fetch_all(&*pool).await.unwrap_or_default();

    let (total_orders, total_purchases): (i64, f64) = sqlx::query_as(
        "SELECT COUNT(*), COALESCE(SUM(total), 0.0)
         FROM sales WHERE customer_id = ? AND status != 'void'"
    ).bind(&customer_id).fetch_one(&*pool).await.unwrap_or((0, 0.0));

    Ok(Customer {
        id: r.get("id"),
        name: r.get("name"),
        email: r.get("email"),
        phone: r.get("phone"),
        address: r.get("address"),
        city: r.get("city"),
        state: r.get("state"),
        zip_code: r.get("zip_code"),
        country: r.get("country"),
        status: r.get("status"),
        notes: r.get("notes"),
        joined_at: r.get("joined_at"),
        last_purchase_at: r.get("last_purchase_at"),
        groups,
        total_orders,
        total_purchases,
    })
}

#[tauri::command]
pub async fn update_customer(
    pool: tauri::State<'_, SqlitePool>,
    customer_id: String,
    name: String,
    email: Option<String>,
    phone: Option<String>,
    address: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip_code: Option<String>,
    country: Option<String>,
    status: String,
    notes: Option<String>,
    group_ids: Option<Vec<String>>,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE customers
         SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?,
             zip_code = ?, country = ?, status = ?, notes = ?
         WHERE id = ?"
    )
    .bind(&name).bind(&email).bind(&phone).bind(&address)
    .bind(&city).bind(&state).bind(&zip_code).bind(&country)
    .bind(&status).bind(&notes).bind(&customer_id)
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    if let Some(gids) = &group_ids {
        sqlx::query("DELETE FROM customer_group_members WHERE customer_id = ?")
            .bind(&customer_id).execute(&*pool).await.map_err(|e| e.to_string())?;
        for gid in gids {
            sqlx::query("INSERT INTO customer_group_members (customer_id, group_id) VALUES (?, ?)")
                .bind(&customer_id).bind(gid)
                .execute(&*pool).await.map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_customer(
    pool: tauri::State<'_, SqlitePool>,
    customer_id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM customers WHERE id = ?")
        .bind(&customer_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn list_customer_groups(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<CustomerGroup>, String> {
    let rows = sqlx::query(
        "SELECT id, name, description, discount_pct FROM customer_groups ORDER BY name"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| CustomerGroup {
        id: r.get("id"),
        name: r.get("name"),
        description: r.get("description"),
        discount_pct: r.get::<Option<f64>, _>("discount_pct").unwrap_or(0.0),
    }).collect())
}

#[tauri::command]
pub async fn create_customer_group(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    description: Option<String>,
    discount_pct: Option<f64>,
) -> Result<CustomerGroup, String> {
    let id = new_id();
    let disc = discount_pct.unwrap_or(0.0);

    sqlx::query(
        "INSERT INTO customer_groups (id, name, description, discount_pct) VALUES (?, ?, ?, ?)"
    )
    .bind(&id).bind(&name).bind(&description).bind(disc)
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(CustomerGroup { id, name, description, discount_pct: disc })
}

#[derive(Serialize)]
pub struct CustomerPurchase {
    pub sale_id: String,
    pub receipt_no: String,
    pub total: f64,
    pub status: String,
    pub sold_at: String,
    pub items: i64,
}

#[tauri::command]
pub async fn list_customer_purchases(
    pool: tauri::State<'_, SqlitePool>,
    customer_id: String,
) -> Result<Vec<CustomerPurchase>, String> {
    let rows = sqlx::query(
        "SELECT s.id, s.receipt_no, s.total, s.status, s.sold_at,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) AS items
         FROM sales s
         WHERE s.customer_id = ?
         ORDER BY s.sold_at DESC"
    ).bind(&customer_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| CustomerPurchase {
        sale_id: r.get("id"),
        receipt_no: r.get("receipt_no"),
        total: r.get("total"),
        status: r.get("status"),
        sold_at: r.get("sold_at"),
        items: r.get("items"),
    }).collect())
}
