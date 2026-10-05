use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

const SESSION_DAYS: i64 = 7;
const ACCESS_MINUTES: i64 = 30;
const REFRESH_DAYS: i64 = 30;

#[derive(Serialize, Deserialize)]
pub struct UserRow {
    pub id: String,
    pub username: String,
    pub full_name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub status: String,
    pub is_superuser: bool,
}

#[derive(Serialize)]
pub struct LoginResult {
    pub user: UserRow,
    pub session_token: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: String,
}

pub fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| e.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    match PasswordHash::new(hash) {
        Ok(parsed) => Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok(),
        Err(_) => false,
    }
}

pub fn now_iso() -> String {
    Utc::now().to_rfc3339()
}

pub fn add_minutes(mins: i64) -> String {
    (Utc::now() + Duration::minutes(mins)).to_rfc3339()
}

pub fn add_days(days: i64) -> String {
    (Utc::now() + Duration::days(days)).to_rfc3339()
}

pub fn new_id() -> String {
    Uuid::new_v4().to_string()
}

pub fn new_token() -> String {
    format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple())
}

// ---------- Seeding ----------
pub async fn seed_defaults(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT OR IGNORE INTO groups (id, name, description, is_system) VALUES
         ('grp_admin', 'Admin', 'Full system access', 1),
         ('grp_cashier', 'Cashier', 'POS and sales only', 1)"
    ).execute(pool).await?;

    let perms: Vec<(&str, &str, &str, &str)> = vec![
        ("perm_sales_pos", "sales.pos", "Sales", "Use POS"),
        ("perm_sales_view_own", "sales.view_own", "Sales", "View own sales"),
        ("perm_sales_view_all", "sales.view_all", "Sales", "View all sales"),
        ("perm_sales_refund", "sales.refund", "Sales", "Process refunds"),
        ("perm_sales_void", "sales.void", "Sales", "Void sales"),
        ("perm_sales_discount", "sales.discount", "Sales", "Apply discounts"),
        ("perm_sales_override", "sales.discount_override", "Sales", "Override max discount"),
        ("perm_inv_view", "inventory.view", "Inventory", "View products"),
        ("perm_inv_create", "inventory.create", "Inventory", "Add products"),
        ("perm_inv_edit", "inventory.edit", "Inventory", "Edit products"),
        ("perm_inv_delete", "inventory.delete", "Inventory", "Delete products"),
        ("perm_inv_adjust", "inventory.adjust_stock", "Inventory", "Adjust stock"),
        ("perm_inv_bulk", "inventory.bulk_import", "Inventory", "Bulk import"),
        ("perm_cust_view", "customers.view", "Customers", "View customers"),
        ("perm_cust_create", "customers.create", "Customers", "Add customers"),
        ("perm_cust_edit", "customers.edit", "Customers", "Edit customers"),
        ("perm_cust_delete", "customers.delete", "Customers", "Delete customers"),
        ("perm_purch_view", "purchases.view", "Purchases", "View purchase orders"),
        ("perm_purch_create", "purchases.create", "Purchases", "Create purchase orders"),
        ("perm_purch_receive", "purchases.receive", "Purchases", "Receive stock"),
        ("perm_purch_approve", "purchases.approve", "Purchases", "Approve purchases"),
        ("perm_inv_view_inv", "invoices.view", "Invoices", "View invoices"),
        ("perm_inv_create_inv", "invoices.create", "Invoices", "Create invoices"),
        ("perm_inv_edit_inv", "invoices.edit", "Invoices", "Edit invoices"),
        ("perm_inv_settings", "invoices.settings", "Invoices", "Invoice settings"),
        ("perm_rep_sales", "reports.sales", "Reports", "Sales reports"),
        ("perm_rep_inv", "reports.inventory", "Reports", "Inventory reports"),
        ("perm_rep_fin", "reports.financial", "Reports", "Financial reports"),
        ("perm_rep_export", "reports.export", "Reports", "Export reports"),
        ("perm_users_view", "users.view", "Users", "View users"),
        ("perm_users_create", "users.create", "Users", "Create users"),
        ("perm_users_edit", "users.edit", "Users", "Edit users"),
        ("perm_users_delete", "users.delete", "Users", "Delete users"),
        ("perm_users_groups", "users.groups", "Users", "Manage groups"),
        ("perm_users_perms", "users.permissions", "Users", "Manage permissions"),
        ("perm_sys_settings", "system.settings", "System", "System settings"),
        ("perm_sys_backup", "system.backup", "System", "Backups"),
        ("perm_sys_restore", "system.restore", "System", "Restore data"),
        ("perm_sys_license", "system.license", "System", "License"),
        ("perm_sys_api", "system.api_keys", "System", "API keys"),
    ];

    for (id, code, module, label) in perms {
        sqlx::query(
            "INSERT OR IGNORE INTO permissions (id, code, module, label) VALUES (?, ?, ?, ?)"
        )
        .bind(id).bind(code).bind(module).bind(label)
        .execute(pool).await?;
    }

    sqlx::query(
        "INSERT OR IGNORE INTO group_permissions (group_id, permission_id)
         SELECT 'grp_admin', id FROM permissions"
    ).execute(pool).await?;

    let cashier_perms = vec![
        "perm_sales_pos", "perm_sales_view_own", "perm_sales_discount",
        "perm_inv_view", "perm_cust_view", "perm_cust_create",
        "perm_inv_view_inv", "perm_inv_create_inv",
    ];
    for pid in cashier_perms {
        sqlx::query(
            "INSERT OR IGNORE INTO group_permissions (group_id, permission_id) VALUES ('grp_cashier', ?)"
        ).bind(pid).execute(pool).await?;
    }

    Ok(())
}

// ---------- Commands ----------
#[tauri::command]
pub async fn create_user(
    pool: tauri::State<'_, SqlitePool>,
    username: String,
    password: String,
    full_name: String,
    email: Option<String>,
    phone: Option<String>,
    group_id: String,
) -> Result<UserRow, String> {
    let password_hash = hash_password(&password)?;
    let id = new_id();

    sqlx::query(
        "INSERT INTO users (id, username, email, phone, password_hash, full_name, status, is_superuser)
         VALUES (?, ?, ?, ?, ?, ?, 'active', 0)"
    )
    .bind(&id).bind(&username).bind(&email).bind(&phone)
    .bind(&password_hash).bind(&full_name)
    .execute(&*pool).await
    .map_err(|e| e.to_string())?;

    sqlx::query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)")
        .bind(&id).bind(&group_id)
        .execute(&*pool).await
        .map_err(|e| e.to_string())?;

    write_audit(&pool, None, "Users", "create_user", Some("users"), Some(&id),
        Some(&format!("Created user {}", username))).await;

    Ok(UserRow {
        id,
        username,
        full_name,
        email,
        phone,
        status: "active".into(),
        is_superuser: false,
    })
}

#[tauri::command]
pub async fn login(
    pool: tauri::State<'_, SqlitePool>,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let row = sqlx::query(
        "SELECT id, username, full_name, email, phone, status, is_superuser, password_hash
         FROM users WHERE username = ?"
    )
    .bind(&username)
    .fetch_optional(&*pool).await
    .map_err(|e| e.to_string())?
    .ok_or("Invalid username or password")?;

    let stored_hash: String = row.get("password_hash");
    if !verify_password(&password, &stored_hash) {
        return Err("Invalid username or password".into());
    }

    let user_id: String = row.get("id");
    let session_id = new_id();
    let session_token = new_token();
    let access_token = new_token();
    let refresh_token = new_token();

    let session_expires = add_days(SESSION_DAYS);
    sqlx::query(
        "INSERT INTO sessions (id, user_id, session_token, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?)"
    ).bind(&session_id).bind(&user_id).bind(&session_token).bind(now_iso()).bind(&session_expires)
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO access_tokens (id, user_id, session_id, token, issued_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(new_id()).bind(&user_id).bind(&session_id).bind(&access_token)
    .bind(now_iso()).bind(add_minutes(ACCESS_MINUTES))
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO refresh_tokens (id, user_id, session_id, token, issued_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(new_id()).bind(&user_id).bind(&session_id).bind(&refresh_token)
    .bind(now_iso()).bind(add_days(REFRESH_DAYS))
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    sqlx::query("UPDATE users SET last_login_at = ? WHERE id = ?")
        .bind(now_iso()).bind(&user_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;

    Ok(LoginResult {
        user: UserRow {
            id: user_id,
            username: row.get("username"),
            full_name: row.get("full_name"),
            email: row.get("email"),
            phone: row.get("phone"),
            status: row.get("status"),
            is_superuser: row.get::<i64, _>("is_superuser") != 0,
        },
        session_token,
        access_token,
        refresh_token,
        expires_at: session_expires,
    })
}

#[tauri::command]
pub async fn get_me(
    pool: tauri::State<'_, SqlitePool>,
    session_token: String,
) -> Result<UserRow, String> {
    let row = sqlx::query(
        "SELECT u.id, u.username, u.full_name, u.email, u.phone, u.status, u.is_superuser
         FROM users u
         JOIN sessions s ON s.user_id = u.id
         WHERE s.session_token = ? AND s.revoked_at IS NULL AND s.expires_at > ?"
    )
    .bind(&session_token).bind(now_iso())
    .fetch_optional(&*pool).await
    .map_err(|e| e.to_string())?
    .ok_or("Session invalid or expired")?;

    Ok(UserRow {
        id: row.get("id"),
        username: row.get("username"),
        full_name: row.get("full_name"),
        email: row.get("email"),
        phone: row.get("phone"),
        status: row.get("status"),
        is_superuser: row.get::<i64, _>("is_superuser") != 0,
    })
}

#[tauri::command]
pub async fn logout(
    pool: tauri::State<'_, SqlitePool>,
    session_token: String,
) -> Result<(), String> {
    sqlx::query("UPDATE sessions SET revoked_at = ? WHERE session_token = ?")
        .bind(now_iso()).bind(&session_token)
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Serialize)]
pub struct UserWithGroups {
    pub id: String,
    pub username: String,
    pub full_name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub status: String,
    pub is_superuser: bool,
    pub groups: Vec<String>,
}

#[tauri::command]
pub async fn list_users(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<UserWithGroups>, String> {
    let users = sqlx::query(
        "SELECT id, username, full_name, email, phone, status, is_superuser
         FROM users ORDER BY created_at DESC"
    )
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out: Vec<UserWithGroups> = Vec::new();
    for u in users {
        let id: String = u.get("id");
        let groups: Vec<String> = sqlx::query_scalar(
            "SELECT g.name FROM groups g
             JOIN user_groups ug ON ug.group_id = g.id
             WHERE ug.user_id = ?"
        ).bind(&id).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

        out.push(UserWithGroups {
            id,
            username: u.get("username"),
            full_name: u.get("full_name"),
            email: u.get("email"),
            phone: u.get("phone"),
            status: u.get("status"),
            is_superuser: u.get::<i64, _>("is_superuser") != 0,
            groups,
        });
    }
    Ok(out)
}

#[derive(Serialize)]
pub struct GroupRow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_system: bool,
}

#[tauri::command]
pub async fn list_groups(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<GroupRow>, String> {
    let rows = sqlx::query(
        "SELECT id, name, description, is_system FROM groups ORDER BY is_system DESC, name"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| GroupRow {
        id: r.get("id"),
        name: r.get("name"),
        description: r.get("description"),
        is_system: r.get::<i64, _>("is_system") != 0,
    }).collect())
}

#[tauri::command]
pub async fn list_permissions(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query(
        "SELECT id, code, module, label FROM permissions ORDER BY module, label"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| serde_json::json!({
        "id": r.get::<String, _>("id"),
        "code": r.get::<String, _>("code"),
        "module": r.get::<String, _>("module"),
        "label": r.get::<String, _>("label"),
    })).collect())
}

#[tauri::command]
pub async fn create_group(
    pool: tauri::State<'_, SqlitePool>,
    name: String,
    description: Option<String>,
) -> Result<GroupRow, String> {
    let id = new_id();
    sqlx::query(
        "INSERT INTO groups (id, name, description, is_system) VALUES (?, ?, ?, 0)"
    )
    .bind(&id).bind(&name).bind(&description)
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    write_audit(&pool, None, "Users", "create_group", Some("groups"), Some(&id),
        Some(&format!("Created group {}", name))).await;

    Ok(GroupRow { id, name, description, is_system: false })
}

#[tauri::command]
pub async fn delete_group(
    pool: tauri::State<'_, SqlitePool>,
    group_id: String,
) -> Result<(), String> {
    let is_system: i64 = sqlx::query_scalar("SELECT is_system FROM groups WHERE id = ?")
        .bind(&group_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;
    if is_system != 0 {
        return Err("Cannot delete system groups".into());
    }
    sqlx::query("DELETE FROM groups WHERE id = ?")
        .bind(&group_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    write_audit(&pool, None, "Users", "delete_group", Some("groups"), Some(&group_id),
        Some("Deleted group")).await;
    Ok(())
}

#[tauri::command]
pub async fn get_group_permissions(
    pool: tauri::State<'_, SqlitePool>,
    group_id: String,
) -> Result<Vec<String>, String> {
    sqlx::query_scalar::<_, String>(
        "SELECT permission_id FROM group_permissions WHERE group_id = ?"
    ).bind(&group_id).fetch_all(&*pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_group_permissions(
    pool: tauri::State<'_, SqlitePool>,
    group_id: String,
    permission_ids: Vec<String>,
) -> Result<(), String> {
    sqlx::query("DELETE FROM group_permissions WHERE group_id = ?")
        .bind(&group_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    for pid in permission_ids {
        sqlx::query("INSERT INTO group_permissions (group_id, permission_id) VALUES (?, ?)")
            .bind(&group_id).bind(&pid)
            .execute(&*pool).await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn set_user_groups(
    pool: tauri::State<'_, SqlitePool>,
    user_id: String,
    group_ids: Vec<String>,
) -> Result<(), String> {
    sqlx::query("DELETE FROM user_groups WHERE user_id = ?")
        .bind(&user_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    for gid in group_ids {
        sqlx::query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)")
            .bind(&user_id).bind(&gid)
            .execute(&*pool).await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_user_groups(
    pool: tauri::State<'_, SqlitePool>,
    user_id: String,
) -> Result<Vec<String>, String> {
    sqlx::query_scalar::<_, String>(
        "SELECT group_id FROM user_groups WHERE user_id = ?"
    ).bind(&user_id).fetch_all(&*pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_user(
    pool: tauri::State<'_, SqlitePool>,
    user_id: String,
    full_name: String,
    email: Option<String>,
    phone: Option<String>,
    status: String,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE users SET full_name = ?, email = ?, phone = ?, status = ?, updated_at = ?
         WHERE id = ?"
    )
    .bind(&full_name).bind(&email).bind(&phone).bind(&status).bind(now_iso())
    .bind(&user_id)
    .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn reset_user_password(
    pool: tauri::State<'_, SqlitePool>,
    user_id: String,
    new_password: String,
) -> Result<(), String> {
    if new_password.len() < 8 {
        return Err("Password must be at least 8 characters".into());
    }
    let hash = hash_password(&new_password)?;
    sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
        .bind(&hash).bind(now_iso()).bind(&user_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_user(
    pool: tauri::State<'_, SqlitePool>,
    user_id: String,
) -> Result<(), String> {
    // prevent deleting the last admin
    let admin_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM users u
         JOIN user_groups ug ON ug.user_id = u.id
         WHERE ug.group_id = 'grp_admin'"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let is_admin: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM user_groups WHERE user_id = ? AND group_id = 'grp_admin'"
    ).bind(&user_id).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    if is_admin > 0 && admin_count <= 1 {
        return Err("Cannot delete the last admin user".into());
    }

    sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(&user_id).execute(&*pool).await.map_err(|e| e.to_string())?;
    write_audit(&pool, None, "Users", "delete_user", Some("users"), Some(&user_id),
        Some("Deleted user")).await;
    Ok(())
}

// ---------- Audit ----------
pub async fn write_audit(
    pool: &SqlitePool,
    user_id: Option<&str>,
    module: &str,
    action: &str,
    target_table: Option<&str>,
    target_id: Option<&str>,
    details: Option<&str>,
) {
    let _ = sqlx::query(
        "INSERT INTO audit_log (id, user_id, module, action, target_table, target_id, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(new_id())
    .bind(user_id)
    .bind(module)
    .bind(action)
    .bind(target_table)
    .bind(target_id)
    .bind(details)
    .bind(now_iso())
    .execute(pool).await;
}

#[tauri::command]
pub async fn list_audit_log(
    pool: tauri::State<'_, SqlitePool>,
    limit: Option<i64>,
) -> Result<Vec<serde_json::Value>, String> {
    let lim = limit.unwrap_or(200);
    let rows = sqlx::query(
        "SELECT a.id, a.module, a.action, a.target_table, a.target_id, a.details, a.created_at,
                u.username
         FROM audit_log a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC
         LIMIT ?"
    ).bind(lim).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| serde_json::json!({
        "id": r.get::<String, _>("id"),
        "module": r.get::<String, _>("module"),
        "action": r.get::<String, _>("action"),
        "target_table": r.get::<Option<String>, _>("target_table"),
        "target_id": r.get::<Option<String>, _>("target_id"),
        "details": r.get::<Option<String>, _>("details"),
        "created_at": r.get::<String, _>("created_at"),
        "username": r.get::<Option<String>, _>("username"),
    })).collect())
}

#[tauri::command]
pub async fn request_password_reset(
    pool: tauri::State<'_, SqlitePool>,
    identifier: String,
) -> Result<String, String> {
    // find user by username or phone or email
    let row = sqlx::query(
        "SELECT id, username, email, phone FROM users
         WHERE username = ? OR phone = ? OR email = ?
         LIMIT 1"
    )
    .bind(&identifier).bind(&identifier).bind(&identifier)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("No account found with that identifier")?;

    let user_id: String = row.get("id");
    let otp = format!("{:06}", rand::random::<u32>() % 1_000_000);

    // expires in 15 minutes
    let expires_at = add_minutes(15);

    sqlx::query(
        "INSERT INTO otp_codes (id, user_id, code, purpose, channel, created_at, expires_at)
         VALUES (?, ?, ?, 'reset', 'email', ?, ?)"
    )
    .bind(new_id()).bind(&user_id).bind(&otp)
    .bind(now_iso()).bind(&expires_at)
    .execute(&*pool).await.map_err(|e| e.to_string())?;

    write_audit(&pool, Some(&user_id), "Auth", "request_reset", Some("otp_codes"), None,
        Some("Password reset requested")).await;

    // In dev, return the OTP so you can test. In production, send by email/SMS.
    Ok(otp)
}

#[tauri::command]
pub async fn verify_reset_otp(
    pool: tauri::State<'_, SqlitePool>,
    identifier: String,
    otp: String,
    new_password: String,
) -> Result<(), String> {
    if new_password.len() < 8 {
        return Err("Password must be at least 8 characters".into());
    }

    let user_row = sqlx::query(
        "SELECT id FROM users WHERE username = ? OR phone = ? OR email = ? LIMIT 1"
    )
    .bind(&identifier).bind(&identifier).bind(&identifier)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Account not found")?;
    let user_id: String = user_row.get("id");

    let otp_row = sqlx::query(
        "SELECT id, expires_at, used_at FROM otp_codes
         WHERE user_id = ? AND code = ? AND purpose = 'reset'
         ORDER BY created_at DESC LIMIT 1"
    )
    .bind(&user_id).bind(&otp)
    .fetch_optional(&*pool).await.map_err(|e| e.to_string())?
    .ok_or("Invalid or expired code")?;

    if otp_row.get::<Option<String>, _>("used_at").is_some() {
        return Err("This code has already been used".into());
    }
    let expires: String = otp_row.get("expires_at");
    if expires < now_iso() {
        return Err("This code has expired".into());
    }

    let otp_id: String = otp_row.get("id");
    let hash = hash_password(&new_password)?;

    sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
        .bind(&hash).bind(now_iso()).bind(&user_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;

    sqlx::query("UPDATE otp_codes SET used_at = ? WHERE id = ?")
        .bind(now_iso()).bind(&otp_id)
        .execute(&*pool).await.map_err(|e| e.to_string())?;

    write_audit(&pool, Some(&user_id), "Auth", "reset_password", Some("users"), Some(&user_id),
        Some("Password reset via OTP")).await;

    Ok(())
}
