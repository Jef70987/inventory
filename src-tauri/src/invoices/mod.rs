use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

fn new_id() -> String { Uuid::new_v4().to_string() }
fn now_iso() -> String { chrono::Utc::now().to_rfc3339() }
fn today() -> String { chrono::Utc::now().format("%Y-%m-%d").to_string() }

fn format_invoice(n: i64) -> String {
    let year = chrono::Utc::now().format("%Y").to_string();
    format!("INV-{}-{:04}", year, n)
}

#[derive(Deserialize)]
pub struct InvoiceItemInput {
    pub product_id: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
}

#[derive(Serialize)]
pub struct Invoice {
    pub id: String,
    pub invoice_no: String,
    pub customer_id: Option<String>,
    pub customer_name: Option<String>,
    pub status: String,
    pub issue_date: String,
    pub due_date: Option<String>,
    pub subtotal: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub amount_paid: f64,
    pub balance: f64,
    pub notes: Option<String>,
    pub created_at: String,
    pub items: Vec<InvoiceItemRow>,
    pub payments: Vec<InvoicePaymentRow>,
}

#[derive(Serialize)]
pub struct InvoiceItemRow {
    pub id: String,
    pub product_id: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub line_total: f64,
}

#[derive(Serialize)]
pub struct InvoicePaymentRow {
    pub id: String,
    pub amount: f64,
    pub method: Option<String>,
    pub reference: Option<String>,
    pub paid_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct InvoiceSettings {
    pub company_name: Option<String>,
    pub company_address: Option<String>,
    pub company_phone: Option<String>,
    pub company_email: Option<String>,
    pub company_website: Option<String>,
    pub logo_path: Option<String>,
    pub currency: String,
    pub invoice_prefix: String,
    pub next_number: i64,
    pub payment_terms: Option<String>,
    pub footer_text: Option<String>,
}

#[tauri::command]
pub async fn create_invoice(
    pool: tauri::State<'_, SqlitePool>,
    customer_id: Option<String>,
    issue_date: Option<String>,
    due_date: Option<String>,
    notes: Option<String>,
    discount_amount: Option<f64>,
    user_id: Option<String>,
    items: Vec<InvoiceItemInput>,
) -> Result<String, String> {
    if items.is_empty() {
        return Err("Invoice must have at least one item".into());
    }

    let subtotal: f64 = items.iter().map(|i| i.quantity * i.unit_price).sum();
    let disc = discount_amount.unwrap_or(0.0);
    let total = (subtotal - disc).max(0.0);

    let next: i64 = sqlx::query_scalar(
        "SELECT next_number FROM invoice_settings LIMIT 1"
    ).fetch_optional(&*pool).await.map_err(|e| e.to_string())?.unwrap_or(1);

    let invoice_no = format_invoice(next);
    let invoice_id = new_id();
    let issue = issue_date.unwrap_or_else(today);

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO invoices
         (id, invoice_no, customer_id, status, issue_date, due_date,
          subtotal, discount_amount, total, amount_paid, notes, created_by, created_at)
         VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, 0, ?, ?, ?)"
    )
    .bind(&invoice_id).bind(&invoice_no).bind(&customer_id)
    .bind(&issue).bind(&due_date)
    .bind(subtotal).bind(disc).bind(total)
    .bind(&notes).bind(&user_id).bind(now_iso())
    .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &items {
        sqlx::query(
            "INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, line_total)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(new_id()).bind(&invoice_id).bind(&it.product_id).bind(&it.description)
         .bind(it.quantity).bind(it.unit_price).bind(it.quantity * it.unit_price)
         .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    sqlx::query("UPDATE invoice_settings SET next_number = next_number + 1")
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(invoice_id)
}

async fn load_invoice(pool: &SqlitePool, invoice_id: &str) -> Result<Invoice, String> {
    let r = sqlx::query(
        "SELECT i.id, i.invoice_no, i.customer_id, c.name AS customer_name,
                i.status, i.issue_date, i.due_date, i.subtotal, i.discount_amount,
                i.total, i.amount_paid, i.notes, i.created_at
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         WHERE i.id = ?"
    ).bind(invoice_id)
    .fetch_optional(pool).await.map_err(|e| e.to_string())?
    .ok_or("Invoice not found")?;

    let items_rows = sqlx::query(
        "SELECT id, product_id, description, quantity, unit_price, line_total
         FROM invoice_items WHERE invoice_id = ?"
    ).bind(invoice_id).fetch_all(pool).await.map_err(|e| e.to_string())?;

    let pay_rows = sqlx::query(
        "SELECT id, amount, method, reference, paid_at
         FROM invoice_payments WHERE invoice_id = ?
         ORDER BY paid_at DESC"
    ).bind(invoice_id).fetch_all(pool).await.map_err(|e| e.to_string())?;

    let total: f64 = r.get("total");
    let amount_paid: f64 = r.get("amount_paid");

    Ok(Invoice {
        id: r.get("id"),
        invoice_no: r.get("invoice_no"),
        customer_id: r.get("customer_id"),
        customer_name: r.get("customer_name"),
        status: r.get("status"),
        issue_date: r.get("issue_date"),
        due_date: r.get("due_date"),
        subtotal: r.get("subtotal"),
        discount_amount: r.get("discount_amount"),
        total,
        amount_paid,
        balance: (total - amount_paid).max(0.0),
        notes: r.get("notes"),
        created_at: r.get("created_at"),
        items: items_rows.into_iter().map(|r| InvoiceItemRow {
            id: r.get("id"),
            product_id: r.get("product_id"),
            description: r.get("description"),
            quantity: r.get("quantity"),
            unit_price: r.get("unit_price"),
            line_total: r.get("line_total"),
        }).collect(),
        payments: pay_rows.into_iter().map(|r| InvoicePaymentRow {
            id: r.get("id"),
            amount: r.get("amount"),
            method: r.get("method"),
            reference: r.get("reference"),
            paid_at: r.get("paid_at"),
        }).collect(),
    })
}

#[tauri::command]
pub async fn list_invoices(
    pool: tauri::State<'_, SqlitePool>,
    search: Option<String>,
) -> Result<Vec<Invoice>, String> {
    let like = search.map(|s| format!("%{}%", s)).unwrap_or_else(|| "%".to_string());

    let rows = sqlx::query(
        "SELECT i.id FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         WHERE i.invoice_no LIKE ? OR c.name LIKE ?
         ORDER BY i.created_at DESC"
    ).bind(&like).bind(&like)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for r in rows {
        let id: String = r.get("id");
        out.push(load_invoice(&pool, &id).await?);
    }
    Ok(out)
}

#[tauri::command]
pub async fn get_invoice(
    pool: tauri::State<'_, SqlitePool>,
    invoice_id: String,
) -> Result<Invoice, String> {
    load_invoice(&pool, &invoice_id).await
}

#[tauri::command]
pub async fn update_invoice_status(
    pool: tauri::State<'_, SqlitePool>,
    invoice_id: String,
    status: String,
) -> Result<(), String> {
    let allowed = ["pending", "paid", "unpaid", "overdue", "void"];
    if !allowed.contains(&status.as_str()) {
        return Err("Invalid status".into());
    }
    sqlx::query("UPDATE invoices SET status = ? WHERE id = ?")
        .bind(&status).bind(&invoice_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn add_invoice_payment(
    pool: tauri::State<'_, SqlitePool>,
    invoice_id: String,
    amount: f64,
    method: Option<String>,
    reference: Option<String>,
) -> Result<(), String> {
    if amount <= 0.0 {
        return Err("Amount must be greater than zero".into());
    }

    let inv = sqlx::query(
        "SELECT total, amount_paid FROM invoices WHERE id = ?"
    ).bind(&invoice_id).fetch_optional(&*pool).await.map_err(|e| e.to_string())?
     .ok_or("Invoice not found")?;

    let total: f64 = inv.get("total");
    let paid: f64 = inv.get("amount_paid");
    let new_paid = paid + amount;

    if new_paid > total + 0.001 {
        return Err(format!("Payment exceeds balance. Remaining: {}", (total - paid).max(0.0)));
    }

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO invoice_payments (id, invoice_id, amount, method, reference, paid_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(new_id()).bind(&invoice_id).bind(amount).bind(&method).bind(&reference).bind(now_iso())
     .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    let new_status = if new_paid + 0.001 >= total { "paid" } else { "unpaid" };
    sqlx::query("UPDATE invoices SET amount_paid = ?, status = ? WHERE id = ?")
        .bind(new_paid).bind(new_status).bind(&invoice_id)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_invoice(
    pool: tauri::State<'_, SqlitePool>,
    invoice_id: String,
) -> Result<(), String> {
    let paid: f64 = sqlx::query_scalar("SELECT amount_paid FROM invoices WHERE id = ?")
        .bind(&invoice_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if paid > 0.0 {
        return Err("Cannot delete an invoice that has payments".into());
    }

    sqlx::query("DELETE FROM invoice_items WHERE invoice_id = ?").bind(&invoice_id).execute(&*pool).await.ok();
    sqlx::query("DELETE FROM invoice_payments WHERE invoice_id = ?").bind(&invoice_id).execute(&*pool).await.ok();
    sqlx::query("DELETE FROM invoices WHERE id = ?").bind(&invoice_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_invoice_settings(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<InvoiceSettings, String> {
    let r = sqlx::query(
        "SELECT company_name, company_address, company_phone, company_email,
                company_website, logo_path, currency, invoice_prefix, next_number,
                payment_terms, footer_text
         FROM invoice_settings LIMIT 1"
    ).fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

    Ok(match r {
        Some(row) => InvoiceSettings {
            company_name: row.get("company_name"),
            company_address: row.get("company_address"),
            company_phone: row.get("company_phone"),
            company_email: row.get("company_email"),
            company_website: row.get("company_website"),
            logo_path: row.get("logo_path"),
            currency: row.get("currency"),
            invoice_prefix: row.get("invoice_prefix"),
            next_number: row.get("next_number"),
            payment_terms: row.get("payment_terms"),
            footer_text: row.get("footer_text"),
        },
        None => InvoiceSettings {
            company_name: None,
            company_address: None,
            company_phone: None,
            company_email: None,
            company_website: None,
            logo_path: None,
            currency: "KES".into(),
            invoice_prefix: "INV".into(),
            next_number: 1,
            payment_terms: None,
            footer_text: None,
        },
    })
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn save_invoice_settings(
    pool: tauri::State<'_, SqlitePool>,
    company_name: Option<String>,
    company_address: Option<String>,
    company_phone: Option<String>,
    company_email: Option<String>,
    company_website: Option<String>,
    logo_path: Option<String>,
    currency: String,
    payment_terms: Option<String>,
    footer_text: Option<String>,
) -> Result<(), String> {
    let existing: Option<String> = sqlx::query_scalar("SELECT id FROM invoice_settings LIMIT 1")
        .fetch_optional(&*pool).await.map_err(|e| e.to_string())?;

    if existing.is_some() {
        sqlx::query(
            "UPDATE invoice_settings SET
                company_name = ?, company_address = ?, company_phone = ?,
                company_email = ?, company_website = ?, logo_path = ?,
                currency = ?, payment_terms = ?, footer_text = ?, updated_at = ?"
        ).bind(&company_name).bind(&company_address).bind(&company_phone)
         .bind(&company_email).bind(&company_website).bind(&logo_path)
         .bind(&currency).bind(&payment_terms).bind(&footer_text).bind(now_iso())
         .execute(&*pool).await.map_err(|e| e.to_string())?;
    } else {
        sqlx::query(
            "INSERT INTO invoice_settings
             (id, company_name, company_address, company_phone, company_email,
              company_website, logo_path, currency, invoice_prefix, next_number,
              payment_terms, footer_text)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INV', 1, ?, ?)"
        ).bind(new_id()).bind(&company_name).bind(&company_address).bind(&company_phone)
         .bind(&company_email).bind(&company_website).bind(&logo_path)
         .bind(&currency).bind(&payment_terms).bind(&footer_text)
         .execute(&*pool).await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub async fn ensure_invoice_settings(pool: &SqlitePool) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM invoice_settings")
        .fetch_one(pool).await.unwrap_or(0);
    if count > 0 { return; }
    let _ = sqlx::query(
        "INSERT OR IGNORE INTO invoice_settings
         (id, currency, invoice_prefix, next_number)
         VALUES ('invoice_settings_singleton', 'KES', 'INV', 1)"
    ).execute(pool).await;
}
