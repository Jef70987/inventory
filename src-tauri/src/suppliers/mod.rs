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
pub struct Supplier {
    pub id: String,
    pub name: String,
    pub contact_name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub payment_terms: Option<String>,
    pub rating: f64,
    pub is_active: bool,
    pub created_at: String,
    pub total_orders: i64,
    pub total_spend: f64,
}

#[derive(Serialize)]
pub struct LedgerEntry {
    pub id: String,
    pub entry_type: String,
    pub amount: f64,
    pub reference: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub async fn create_supplier(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    contact_name: Option<String>,
    phone: Option<String>,
    email: Option<String>,
    address: Option<String>,
    payment_terms: Option<String>,
    rating: Option<f64>,
) -> Result<Supplier, String> {
    let id = new_id();
    let r = rating.unwrap_or(0.0);

    sqlx::query(
        "INSERT INTO suppliers (id, name, contact_name, phone, email, address, payment_terms, rating, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)"
    )
    .bind(&id).bind(&name).bind(&contact_name).bind(&phone)
    .bind(&email).bind(&address).bind(&payment_terms).bind(r).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(Supplier {
        id, name, contact_name, phone, email, address, payment_terms,
        rating: r, is_active: true, created_at: now_iso(),
        total_orders: 0, total_spend: 0.0,
    })
}

#[tauri::command]
pub async fn list_suppliers(
    pool: tauri::State<'_, SqlitePool>,
    search: Option<String>,
) -> Result<Vec<Supplier>, String> {
    let like = search.map(|s| format!("%{}%", s)).unwrap_or_else(|| "%".to_string());

    let rows = sqlx::query(
        "SELECT id, name, contact_name, phone, email, address, payment_terms, rating, is_active, created_at
         FROM suppliers
         WHERE name LIKE ? OR contact_name LIKE ? OR phone LIKE ?
         ORDER BY name ASC"
    )
    .bind(&like).bind(&like).bind(&like)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out: Vec<Supplier> = Vec::new();
    for r in rows {
        let id: String = r.get("id");

        let (total_orders, total_spend): (i64, f64) = sqlx::query_as(
            "SELECT COUNT(*), COALESCE(SUM(total), 0.0)
             FROM purchase_orders WHERE supplier_id = ?"
        ).bind(&id).fetch_one(&*pool).await.unwrap_or((0, 0.0));

        out.push(Supplier {
            id,
            name: r.get("name"),
            contact_name: r.get("contact_name"),
            phone: r.get("phone"),
            email: r.get("email"),
            address: r.get("address"),
            payment_terms: r.get("payment_terms"),
            rating: r.get::<Option<f64>, _>("rating").unwrap_or(0.0),
            is_active: r.get::<i64, _>("is_active") != 0,
            created_at: r.get("created_at"),
            total_orders,
            total_spend,
        });
    }
    Ok(out)
}

#[tauri::command]
pub async fn get_supplier(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
) -> Result<Supplier, String> {
    let r = sqlx::query(
        "SELECT id, name, contact_name, phone, email, address, payment_terms, rating, is_active, created_at
         FROM suppliers WHERE id = ?"
    )
    .bind(&supplier_id)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Supplier not found")?;

    let (total_orders, total_spend): (i64, f64) = sqlx::query_as(
        "SELECT COUNT(*), COALESCE(SUM(total), 0.0)
         FROM purchase_orders WHERE supplier_id = ?"
    ).bind(&supplier_id).fetch_one(&*pool).await.unwrap_or((0, 0.0));

    Ok(Supplier {
        id: r.get("id"),
        name: r.get("name"),
        contact_name: r.get("contact_name"),
        phone: r.get("phone"),
        email: r.get("email"),
        address: r.get("address"),
        payment_terms: r.get("payment_terms"),
        rating: r.get::<Option<f64>, _>("rating").unwrap_or(0.0),
        is_active: r.get::<i64, _>("is_active") != 0,
        created_at: r.get("created_at"),
        total_orders,
        total_spend,
    })
}

#[tauri::command]
pub async fn update_supplier(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
    name: String,
    contact_name: Option<String>,
    phone: Option<String>,
    email: Option<String>,
    address: Option<String>,
    payment_terms: Option<String>,
    rating: Option<f64>,
    is_active: bool,
) -> Result<(), String> {
    let r = rating.unwrap_or(0.0);
    sqlx::query(
        "UPDATE suppliers
         SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?,
             payment_terms = ?, rating = ?, is_active = ?
         WHERE id = ?"
    )
    .bind(&name).bind(&contact_name).bind(&phone).bind(&email)
    .bind(&address).bind(&payment_terms).bind(r)
    .bind(if is_active { 1 } else { 0 })
    .bind(&supplier_id)
    .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_supplier(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
) -> Result<(), String> {
    // Prevent deleting a supplier that has purchase orders
    let po_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = ?"
    ).bind(&supplier_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if po_count > 0 {
        return Err("Cannot delete supplier with existing purchase orders".into());
    }

    sqlx::query("DELETE FROM suppliers WHERE id = ?")
        .bind(&supplier_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn list_supplier_ledger(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
) -> Result<Vec<LedgerEntry>, String> {
    let rows = sqlx::query(
        "SELECT id, entry_type, amount, reference, notes, created_at
         FROM supplier_ledger WHERE supplier_id = ?
         ORDER BY created_at DESC"
    ).bind(&supplier_id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| LedgerEntry {
        id: r.get("id"),
        entry_type: r.get("entry_type"),
        amount: r.get("amount"),
        reference: r.get("reference"),
        notes: r.get("notes"),
        created_at: r.get("created_at"),
    }).collect())
}

#[tauri::command]
pub async fn add_supplier_ledger_entry(
    pool: tauri::State<'_, SqlitePool>,
    supplier_id: String,
    entry_type: String,
    amount: f64,
    reference: Option<String>,
    notes: Option<String>,
) -> Result<(), String> {
    if entry_type != "debit" && entry_type != "credit" {
        return Err("entry_type must be debit or credit".into());
    }
    sqlx::query(
        "INSERT INTO supplier_ledger (id, supplier_id, entry_type, amount, reference, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(new_id()).bind(&supplier_id).bind(&entry_type).bind(amount)
    .bind(&reference).bind(&notes).bind(now_iso())
    .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
