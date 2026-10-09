mod auth;
mod customers;
mod invoices;
mod lookups;
mod products;
mod purchases;
mod reports;
mod sales;
mod shop;
mod stock;
mod suppliers;
mod warehouses;

use sqlx::SqlitePool;
use tauri::Manager;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration { version: 1, description: "auth_tables",
            sql: include_str!("../db/01_auth.sql"), kind: MigrationKind::Up },
        Migration { version: 2, description: "shop_license_tables",
            sql: include_str!("../db/02_shop_license.sql"), kind: MigrationKind::Up },
        Migration { version: 3, description: "products_customers_tables",
            sql: include_str!("../db/03_products_customers.sql"), kind: MigrationKind::Up },
        Migration { version: 4, description: "sales_invoices_notifications_tables",
            sql: include_str!("../db/04_sales_invoices_notifications.sql"), kind: MigrationKind::Up },
        Migration { version: 5, description: "accounting_tables",
            sql: include_str!("../db/05_accounting.sql"), kind: MigrationKind::Up },
        Migration { version: 6, description: "logs_recurring_tables",
            sql: include_str!("../db/06_logs_recurring.sql"), kind: MigrationKind::Up },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            Builder::default()
                .add_migrations("sqlite:inventory.db", migrations)
                .build(),
        )
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(800)).await;

                let db_path = dirs_db_path(&handle);
                let url = format!("sqlite:{}?mode=rwc", db_path);
                match SqlitePool::connect(&url).await {
                    Ok(pool) => {
                        if let Err(e) = auth::seed_defaults(&pool).await {
                            eprintln!("Seed failed: {}", e);
                        } else {
                            println!("✅ Seed defaults completed");
                        }
                        warehouses::ensure_default_warehouse(&pool).await;
                        warehouses::ensure_store_settings(&pool).await;
                        invoices::ensure_invoice_settings(&pool).await;
                        handle.manage(pool);
                    }
                    Err(e) => eprintln!("Failed to open DB pool: {}", e),
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth
            auth::create_user,
            auth::login,
            auth::get_me,
            auth::logout,
            auth::list_users,
            auth::list_groups,
            auth::list_permissions,
            auth::create_group,
            auth::delete_group,
            auth::get_group_permissions,
            auth::set_group_permissions,
            auth::set_user_groups,
            auth::get_user_groups,
            auth::update_user,
            auth::reset_user_password,
            auth::delete_user,
            auth::list_audit_log,
            auth::request_password_reset,
            auth::verify_reset_otp,
            // Customers
            customers::create_customer,
            customers::list_customers,
            customers::get_customer,
            customers::update_customer,
            customers::delete_customer,
            customers::list_customer_groups,
            customers::create_customer_group,
            customers::list_customer_purchases,
            // Suppliers
            suppliers::create_supplier,
            suppliers::list_suppliers,
            suppliers::get_supplier,
            suppliers::update_supplier,
            suppliers::delete_supplier,
            suppliers::list_supplier_ledger,
            suppliers::add_supplier_ledger_entry,
            // Lookups
            lookups::create_category,
            lookups::list_categories,
            lookups::delete_category,
            lookups::create_brand,
            lookups::list_brands,
            lookups::delete_brand,
            lookups::create_unit,
            lookups::list_units,
            lookups::delete_unit,
            // Products
            products::create_product,
            products::list_products,
            products::get_product,
            products::update_product,
            products::delete_product,
            purchases::create_purchase_order,
            purchases::list_purchase_orders,
            purchases::get_purchase_order,
            purchases::update_po_status,
            purchases::delete_purchase_order,
            purchases::receive_purchase_order,
            invoices::create_invoice,
            invoices::list_invoices,
            invoices::get_invoice,
            invoices::update_invoice_status,
            invoices::add_invoice_payment,
            invoices::delete_invoice,
            invoices::get_invoice_settings,
            invoices::save_invoice_settings,
            reports::report_daily_sales,
            reports::report_top_products,
            reports::report_profit_margin,
            reports::report_sales_summary,
            reports::report_period,
            reports::report_revenue_tracking,
            reports::report_supplier_performance,
            reports::report_dashboard,
            // Warehouses
            warehouses::create_warehouse,
            warehouses::list_warehouses,
            warehouses::update_warehouse,
            warehouses::set_default_warehouse,
            warehouses::delete_warehouse,
            stock::adjust_stock,
            stock::list_stock_adjustments,
            stock::get_stock_levels,
            stock::transfers::create_transfer,
            stock::transfers::list_transfers,
            stock::transfers::complete_transfer,
            stock::transfers::cancel_transfer,
            stock::transfers::delete_transfer,
            sales::preview_next_receipt,
            sales::complete_sale,
            sales::list_sales,
            sales::list_sales_for_return,
            sales::get_sale,
            sales::create_return,
            sales::list_returns,
            sales::approve_return,
            sales::reject_return,
            // Shop
            shop::save_shop_config,
            shop::get_shop_config,
            shop::check_setup_complete,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn dirs_db_path(app: &tauri::AppHandle) -> String {
    let dir = app.path().app_config_dir().expect("no app config dir");
    std::fs::create_dir_all(&dir).ok();
    dir.join("inventory.db").to_string_lossy().to_string()
}
