use serde::Serialize;
use sqlx::{Row, SqlitePool};

#[derive(Serialize)]
pub struct DailySummary {
    pub date: String,
    pub total_sales: i64,
    pub total_revenue: f64,
    pub avg_order: f64,
    pub unique_customers: i64,
    pub top_products: Vec<TopProduct>,
    pub hourly_sales: Vec<HourlySales>,
    pub payment_methods: Vec<PaymentMethodTotal>,
}

#[derive(Serialize)]
pub struct TopProduct {
    pub product_id: String,
    pub name: String,
    pub sku: String,
    pub quantity: f64,
    pub revenue: f64,
}

#[derive(Serialize)]
pub struct HourlySales {
    pub hour: String,
    pub sales: i64,
    pub revenue: f64,
}

#[derive(Serialize)]
pub struct PaymentMethodTotal {
    pub method: String,
    pub amount: f64,
    pub count: i64,
}

#[tauri::command]
pub async fn report_daily_sales(
    pool: tauri::State<'_, SqlitePool>,
    date: String,
) -> Result<DailySummary, String> {
    let totals = sqlx::query(
        "SELECT COUNT(*) AS n,
                COALESCE(SUM(total), 0.0) AS revenue,
                COUNT(DISTINCT customer_id) AS customers
         FROM sales
         WHERE date(sold_at) = ? AND status != 'void'"
    ).bind(&date).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let total_sales: i64 = totals.get("n");
    let total_revenue: f64 = totals.get("revenue");
    let unique_customers: i64 = totals.get("customers");
    let avg_order = if total_sales > 0 { total_revenue / total_sales as f64 } else { 0.0 };

    let tp = sqlx::query(
        "SELECT si.product_id, p.name, p.sku,
                COALESCE(SUM(si.quantity), 0.0) AS qty,
                COALESCE(SUM(si.line_total), 0.0) AS revenue
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         WHERE date(s.sold_at) = ? AND s.status != 'void'
         GROUP BY si.product_id
         ORDER BY revenue DESC
         LIMIT 10"
    ).bind(&date).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let top_products: Vec<TopProduct> = tp.into_iter().map(|r| TopProduct {
        product_id: r.get("product_id"),
        name: r.get::<Option<String>, _>("name").unwrap_or_default(),
        sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
        quantity: r.get("qty"),
        revenue: r.get("revenue"),
    }).collect();

    let hs = sqlx::query(
        "SELECT strftime('%H', sold_at) AS hr, COUNT(*) AS n, COALESCE(SUM(total), 0.0) AS rev
         FROM sales
         WHERE date(sold_at) = ? AND status != 'void'
         GROUP BY hr ORDER BY hr"
    ).bind(&date).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let hourly_sales: Vec<HourlySales> = hs.into_iter().map(|r| {
        let hr: String = r.get("hr");
        let label = format!("{}:00", hr);
        HourlySales {
            hour: label,
            sales: r.get("n"),
            revenue: r.get("rev"),
        }
    }).collect();

    let pm = sqlx::query(
        "SELECT sp.method, COALESCE(SUM(sp.amount), 0.0) AS amt, COUNT(*) AS n
         FROM sale_payments sp
         JOIN sales s ON s.id = sp.sale_id
         WHERE date(s.sold_at) = ? AND s.status != 'void'
         GROUP BY sp.method"
    ).bind(&date).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let payment_methods: Vec<PaymentMethodTotal> = pm.into_iter().map(|r| PaymentMethodTotal {
        method: r.get("method"),
        amount: r.get("amt"),
        count: r.get("n"),
    }).collect();

    Ok(DailySummary {
        date,
        total_sales,
        total_revenue,
        avg_order,
        unique_customers,
        top_products,
        hourly_sales,
        payment_methods,
    })
}

#[derive(Serialize)]
pub struct TopProductReport {
    pub product_id: String,
    pub name: String,
    pub sku: String,
    pub category_name: Option<String>,
    pub quantity: f64,
    pub revenue: f64,
    pub cost: f64,
    pub margin_pct: f64,
    pub rank: i64,
}

#[tauri::command]
pub async fn report_top_products(
    pool: tauri::State<'_, SqlitePool>,
    from_date: String,
    to_date: String,
    limit: Option<i64>,
) -> Result<Vec<TopProductReport>, String> {
    let lim = limit.unwrap_or(20);
    let rows = sqlx::query(
        "SELECT si.product_id,
                p.name, p.sku,
                c.name AS category_name,
                COALESCE(p.cost_price, 0.0) AS cost,
                COALESCE(SUM(si.quantity), 0.0) AS qty,
                COALESCE(SUM(si.line_total), 0.0) AS revenue
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE date(s.sold_at) BETWEEN ? AND ? AND s.status != 'void'
         GROUP BY si.product_id
         ORDER BY revenue DESC
         LIMIT ?"
    )
    .bind(&from_date).bind(&to_date).bind(lim)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out: Vec<TopProductReport> = Vec::new();
    for (i, r) in rows.into_iter().enumerate() {
        let qty: f64 = r.get("qty");
        let revenue: f64 = r.get("revenue");
        let cost: f64 = r.get("cost");
        let total_cost = cost * qty;
        let margin_pct = if revenue > 0.0 {
            ((revenue - total_cost) / revenue) * 100.0
        } else { 0.0 };

        out.push(TopProductReport {
            product_id: r.get("product_id"),
            name: r.get::<Option<String>, _>("name").unwrap_or_default(),
            sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
            category_name: r.get("category_name"),
            quantity: qty,
            revenue,
            cost: total_cost,
            margin_pct,
            rank: (i as i64) + 1,
        });
    }

    Ok(out)
}

#[derive(Serialize, Clone)]
pub struct ProfitRow {
    pub product_id: String,
    pub name: String,
    pub sku: String,
    pub cost_price: f64,
    pub sell_price: f64,
    pub quantity: f64,
    pub revenue: f64,
    pub total_cost: f64,
    pub profit: f64,
    pub margin_pct: f64,
}

#[derive(Serialize)]
pub struct ProfitReport {
    pub rows: Vec<ProfitRow>,
    pub total_revenue: f64,
    pub total_cost: f64,
    pub total_profit: f64,
    pub avg_margin_pct: f64,
    pub highest: Option<ProfitRow>,
    pub lowest: Option<ProfitRow>,
}

#[tauri::command]
pub async fn report_profit_margin(
    pool: tauri::State<'_, SqlitePool>,
    from_date: String,
    to_date: String,
) -> Result<ProfitReport, String> {
    let rows = sqlx::query(
        "SELECT si.product_id,
                p.name, p.sku,
                COALESCE(p.cost_price, 0.0) AS cost_price,
                COALESCE(p.sell_price, 0.0) AS sell_price,
                COALESCE(SUM(si.quantity), 0.0) AS qty,
                COALESCE(SUM(si.line_total), 0.0) AS revenue
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         WHERE date(s.sold_at) BETWEEN ? AND ? AND s.status != 'void'
         GROUP BY si.product_id
         ORDER BY revenue DESC"
    )
    .bind(&from_date).bind(&to_date)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut out: Vec<ProfitRow> = Vec::new();
    let mut total_revenue = 0.0;
    let mut total_cost = 0.0;

    for r in rows {
        let qty: f64 = r.get("qty");
        let revenue: f64 = r.get("revenue");
        let cost_price: f64 = r.get("cost_price");
        let total_cost_row = cost_price * qty;
        let profit = revenue - total_cost_row;
        let margin_pct = if revenue > 0.0 { (profit / revenue) * 100.0 } else { 0.0 };

        total_revenue += revenue;
        total_cost += total_cost_row;

        out.push(ProfitRow {
            product_id: r.get("product_id"),
            name: r.get::<Option<String>, _>("name").unwrap_or_default(),
            sku: r.get::<Option<String>, _>("sku").unwrap_or_default(),
            cost_price,
            sell_price: r.get("sell_price"),
            quantity: qty,
            revenue,
            total_cost: total_cost_row,
            profit,
            margin_pct,
        });
    }

    let total_profit = total_revenue - total_cost;
    let avg_margin_pct = if total_revenue > 0.0 {
        (total_profit / total_revenue) * 100.0
    } else { 0.0 };

    let mut sorted: Vec<ProfitRow> = out.clone();
    sorted.sort_by(|a, b| b.margin_pct.partial_cmp(&a.margin_pct).unwrap_or(std::cmp::Ordering::Equal));
    let highest = sorted.first().cloned();
    let lowest = sorted.last().cloned();

    Ok(ProfitReport {
        rows: out,
        total_revenue,
        total_cost,
        total_profit,
        avg_margin_pct,
        highest,
        lowest,
    })
}

#[derive(Serialize)]
pub struct SalesTrendPoint {
    pub label: String,
    pub revenue: f64,
    pub orders: i64,
}

#[derive(Serialize)]
pub struct CategorySales {
    pub category_id: Option<String>,
    pub category_name: String,
    pub revenue: f64,
    pub units: f64,
}

#[derive(Serialize)]
pub struct SalesReportSummary {
    pub from_date: String,
    pub to_date: String,
    pub total_revenue: f64,
    pub total_orders: i64,
    pub avg_order: f64,
    pub unique_customers: i64,
    pub trend: Vec<SalesTrendPoint>,
    pub by_category: Vec<CategorySales>,
}

#[tauri::command]
pub async fn report_sales_summary(
    pool: tauri::State<'_, SqlitePool>,
    from_date: String,
    to_date: String,
    bucket: Option<String>, // "day" | "month"
) -> Result<SalesReportSummary, String> {
    let bucket = bucket.unwrap_or_else(|| "day".into());

    let totals = sqlx::query(
        "SELECT COUNT(*) AS n,
                COALESCE(SUM(total), 0.0) AS rev,
                COUNT(DISTINCT customer_id) AS customers
         FROM sales
         WHERE date(sold_at) BETWEEN ? AND ? AND status NOT IN ('void','refunded')"
    ).bind(&from_date).bind(&to_date)
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let total_orders: i64 = totals.get("n");
    let total_revenue: f64 = totals.get("rev");
    let unique_customers: i64 = totals.get("customers");
    let avg_order = if total_orders > 0 { total_revenue / total_orders as f64 } else { 0.0 };

    let group_expr = if bucket == "month" { "strftime('%Y-%m', sold_at)" } else { "date(sold_at)" };
    let trend_sql = format!(
        "SELECT {} AS bucket,
                COALESCE(SUM(total), 0.0) AS rev,
                COUNT(*) AS n
         FROM sales
         WHERE date(sold_at) BETWEEN ? AND ? AND status NOT IN ('void','refunded')
         GROUP BY bucket
         ORDER BY bucket",
        group_expr
    );

    let trend_rows = sqlx::query(&trend_sql)
        .bind(&from_date).bind(&to_date)
        .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let trend: Vec<SalesTrendPoint> = trend_rows.into_iter().map(|r| SalesTrendPoint {
        label: r.get("bucket"),
        revenue: r.get("rev"),
        orders: r.get("n"),
    }).collect();

    let cat_rows = sqlx::query(
        "SELECT p.category_id, COALESCE(c.name, 'Uncategorised') AS cat_name,
                COALESCE(SUM(si.line_total), 0.0) AS revenue,
                COALESCE(SUM(si.quantity), 0.0) AS units
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE date(s.sold_at) BETWEEN ? AND ? AND s.status NOT IN ('void','refunded')
         GROUP BY p.category_id
         ORDER BY revenue DESC"
    ).bind(&from_date).bind(&to_date)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let by_category: Vec<CategorySales> = cat_rows.into_iter().map(|r| CategorySales {
        category_id: r.get("category_id"),
        category_name: r.get("cat_name"),
        revenue: r.get("revenue"),
        units: r.get("units"),
    }).collect();

    Ok(SalesReportSummary {
        from_date,
        to_date,
        total_revenue,
        total_orders,
        avg_order,
        unique_customers,
        trend,
        by_category,
    })
}

#[derive(Serialize)]
pub struct PeriodPoint {
    pub label: String,
    pub revenue: f64,
    pub orders: i64,
    pub customers: i64,
}

#[derive(Serialize)]
pub struct PeriodComparison {
    pub current_revenue: f64,
    pub previous_revenue: f64,
    pub revenue_change_pct: f64,
    pub current_orders: i64,
    pub previous_orders: i64,
    pub orders_change_pct: f64,
    pub current_customers: i64,
    pub previous_customers: i64,
    pub customers_change_pct: f64,
}

#[derive(Serialize)]
pub struct PeriodReport {
    pub period: String,
    pub points: Vec<PeriodPoint>,
    pub comparison: PeriodComparison,
}

fn pct(curr: f64, prev: f64) -> f64 {
    if prev == 0.0 { if curr > 0.0 { 100.0 } else { 0.0 } }
    else { ((curr - prev) / prev) * 100.0 }
}

#[tauri::command]
pub async fn report_period(
    pool: tauri::State<'_, SqlitePool>,
    period: String, // "weekly" | "monthly" | "yearly"
    year: i64,
) -> Result<PeriodReport, String> {
    let (group_expr, label_expr, from_date, to_date) = match period.as_str() {
        "weekly" => (
            "strftime('%Y-W%W', sold_at)",
            "strftime('%W', sold_at)",
            format!("{}-01-01", year),
            format!("{}-12-31", year),
        ),
        "yearly" => (
            "strftime('%Y', sold_at)",
            "strftime('%Y', sold_at)",
            format!("{}-01-01", year - 4),
            format!("{}-12-31", year),
        ),
        _ => (
            "strftime('%Y-%m', sold_at)",
            "strftime('%Y-%m', sold_at)",
            format!("{}-01-01", year),
            format!("{}-12-31", year),
        ),
    };

    let sql = format!(
        "SELECT {} AS bucket, {} AS label,
                COALESCE(SUM(total), 0.0) AS rev,
                COUNT(*) AS n,
                COUNT(DISTINCT customer_id) AS customers
         FROM sales
         WHERE date(sold_at) BETWEEN ? AND ? AND status NOT IN ('void','refunded')
         GROUP BY bucket
         ORDER BY bucket",
        group_expr, label_expr
    );

    let rows = sqlx::query(&sql)
        .bind(&from_date).bind(&to_date)
        .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let points: Vec<PeriodPoint> = rows.into_iter().map(|r| PeriodPoint {
        label: r.get("label"),
        revenue: r.get("rev"),
        orders: r.get("n"),
        customers: r.get("customers"),
    }).collect();

    let current_year = year;
    let previous_year = year - 1;

    let curr = sqlx::query(
        "SELECT COALESCE(SUM(total), 0.0) AS rev,
                COUNT(*) AS n,
                COUNT(DISTINCT customer_id) AS customers
         FROM sales
         WHERE strftime('%Y', sold_at) = ? AND status NOT IN ('void','refunded')"
    ).bind(current_year.to_string())
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let prev = sqlx::query(
        "SELECT COALESCE(SUM(total), 0.0) AS rev,
                COUNT(*) AS n,
                COUNT(DISTINCT customer_id) AS customers
         FROM sales
         WHERE strftime('%Y', sold_at) = ? AND status NOT IN ('void','refunded')"
    ).bind(previous_year.to_string())
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let curr_rev: f64 = curr.get("rev");
    let prev_rev: f64 = prev.get("rev");
    let curr_orders: i64 = curr.get("n");
    let prev_orders: i64 = prev.get("n");
    let curr_cust: i64 = curr.get("customers");
    let prev_cust: i64 = prev.get("customers");

    Ok(PeriodReport {
        period,
        points,
        comparison: PeriodComparison {
            current_revenue: curr_rev,
            previous_revenue: prev_rev,
            revenue_change_pct: pct(curr_rev, prev_rev),
            current_orders: curr_orders,
            previous_orders: prev_orders,
            orders_change_pct: pct(curr_orders as f64, prev_orders as f64),
            current_customers: curr_cust,
            previous_customers: prev_cust,
            customers_change_pct: pct(curr_cust as f64, prev_cust as f64),
        },
    })
}

#[derive(Serialize)]
pub struct MonthlyFinances {
    pub month: String,
    pub revenue: f64,
    pub expenses: f64,
    pub profit: f64,
}

#[derive(Serialize)]
pub struct RevenueSource {
    pub method: String,
    pub amount: f64,
    pub count: i64,
}

#[derive(Serialize)]
pub struct RevenueTracking {
    pub from_date: String,
    pub to_date: String,
    pub total_revenue: f64,
    pub total_cogs: f64,
    pub total_operating_expenses: f64,
    pub net_profit: f64,
    pub profit_margin_pct: f64,
    pub monthly: Vec<MonthlyFinances>,
    pub revenue_sources: Vec<RevenueSource>,
}

#[tauri::command]
pub async fn report_revenue_tracking(
    pool: tauri::State<'_, SqlitePool>,
    from_date: String,
    to_date: String,
) -> Result<RevenueTracking, String> {
    // Total revenue from sales
    let rev: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total), 0.0) FROM sales
         WHERE date(sold_at) BETWEEN ? AND ? AND status NOT IN ('void','refunded')"
    ).bind(&from_date).bind(&to_date)
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    // COGS from sale_items (cost_price × qty)
    let cogs: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(p.cost_price * si.quantity), 0.0)
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         WHERE date(s.sold_at) BETWEEN ? AND ? AND s.status NOT IN ('void','refunded')"
    ).bind(&from_date).bind(&to_date)
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    // Operating expenses (from expenses table where type != 'cogs')
    let opex: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(amount), 0.0) FROM expenses
         WHERE date(incurred_on) BETWEEN ? AND ? AND expense_type != 'cogs'"
    ).bind(&from_date).bind(&to_date)
    .fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let net = rev - cogs - opex;
    let margin_pct = if rev > 0.0 { (net / rev) * 100.0 } else { 0.0 };

    // Monthly breakdown
    let monthly_rows = sqlx::query(
        "SELECT strftime('%Y-%m', sold_at) AS m,
                COALESCE(SUM(total), 0.0) AS rev
         FROM sales
         WHERE date(sold_at) BETWEEN ? AND ? AND status NOT IN ('void','refunded')
         GROUP BY m ORDER BY m"
    ).bind(&from_date).bind(&to_date)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut monthly: Vec<MonthlyFinances> = Vec::new();
    for r in monthly_rows {
        let m: String = r.get("m");
        let rev_m: f64 = r.get("rev");

        let cogs_m: f64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(p.cost_price * si.quantity), 0.0)
             FROM sale_items si
             JOIN sales s ON s.id = si.sale_id
             LEFT JOIN products p ON p.id = si.product_id
             WHERE strftime('%Y-%m', s.sold_at) = ? AND s.status NOT IN ('void','refunded')"
        ).bind(&m).fetch_one(&*pool).await.unwrap_or(0.0);

        let exp_m: f64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(amount), 0.0) FROM expenses
             WHERE strftime('%Y-%m', incurred_on) = ?"
        ).bind(&m).fetch_one(&*pool).await.unwrap_or(0.0);

        monthly.push(MonthlyFinances {
            month: m,
            revenue: rev_m,
            expenses: cogs_m + exp_m,
            profit: rev_m - cogs_m - exp_m,
        });
    }

    // Revenue by payment method
    let src_rows = sqlx::query(
        "SELECT sp.method, COALESCE(SUM(sp.amount), 0.0) AS amt, COUNT(*) AS n
         FROM sale_payments sp
         JOIN sales s ON s.id = sp.sale_id
         WHERE date(s.sold_at) BETWEEN ? AND ? AND s.status NOT IN ('void','refunded')
         GROUP BY sp.method ORDER BY amt DESC"
    ).bind(&from_date).bind(&to_date)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let revenue_sources: Vec<RevenueSource> = src_rows.into_iter().map(|r| RevenueSource {
        method: r.get("method"),
        amount: r.get("amt"),
        count: r.get("n"),
    }).collect();

    Ok(RevenueTracking {
        from_date,
        to_date,
        total_revenue: rev,
        total_cogs: cogs,
        total_operating_expenses: opex,
        net_profit: net,
        profit_margin_pct: margin_pct,
        monthly,
        revenue_sources,
    })
}

#[derive(Serialize)]
pub struct SupplierPerf {
    pub supplier_id: String,
    pub name: String,
    pub contact_name: Option<String>,
    pub phone: Option<String>,
    pub total_orders: i64,
    pub received_orders: i64,
    pub pending_orders: i64,
    pub cancelled_orders: i64,
    pub total_spend: f64,
    pub avg_order_value: f64,
    pub rating: f64,
    pub on_time_pct: f64,
    pub status: String,
}

#[derive(Serialize)]
pub struct SupplierPerformanceReport {
    pub suppliers: Vec<SupplierPerf>,
    pub total_suppliers: i64,
    pub total_spend: f64,
    pub avg_rating: f64,
}

#[tauri::command]
pub async fn report_supplier_performance(
    pool: tauri::State<'_, SqlitePool>,
    from_date: String,
    to_date: String,
) -> Result<SupplierPerformanceReport, String> {
    let rows = sqlx::query(
        "SELECT s.id, s.name, s.contact_name, s.phone, s.rating,
                COUNT(po.id) AS total_orders,
                COALESCE(SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END), 0) AS received,
                COALESCE(SUM(CASE WHEN po.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
                COALESCE(SUM(CASE WHEN po.status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled,
                COALESCE(SUM(
                  (SELECT SUM(quantity * unit_cost) FROM purchase_order_items WHERE po_id = po.id)
                ), 0.0) AS total_spend
         FROM suppliers s
         LEFT JOIN purchase_orders po ON po.supplier_id = s.id
             AND date(po.order_date) BETWEEN ? AND ?
         GROUP BY s.id
         ORDER BY total_spend DESC"
    ).bind(&from_date).bind(&to_date)
    .fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let mut suppliers: Vec<SupplierPerf> = Vec::new();
    let mut total_spend_all = 0.0;
    let mut rating_sum = 0.0;

    for r in rows {
        let total_orders: i64 = r.get("total_orders");
        let received: i64 = r.get("received");
        let pending: i64 = r.get("pending");
        let cancelled: i64 = r.get("cancelled");
        let spend: f64 = r.get("total_spend");
        let rating: f64 = r.get::<Option<f64>, _>("rating").unwrap_or(0.0);

        let avg = if total_orders > 0 { spend / total_orders as f64 } else { 0.0 };
        let on_time = if total_orders > 0 {
            (received as f64 / total_orders as f64) * 100.0
        } else { 0.0 };

        let status = if rating >= 4.5 && on_time >= 90.0 { "Excellent" }
            else if rating >= 4.0 && on_time >= 75.0 { "Good" }
            else if rating >= 3.5 { "Average" }
            else { "Poor" };

        total_spend_all += spend;
        rating_sum += rating;

        suppliers.push(SupplierPerf {
            supplier_id: r.get("id"),
            name: r.get("name"),
            contact_name: r.get("contact_name"),
            phone: r.get("phone"),
            total_orders,
            received_orders: received,
            pending_orders: pending,
            cancelled_orders: cancelled,
            total_spend: spend,
            avg_order_value: avg,
            rating,
            on_time_pct: on_time,
            status: status.to_string(),
        });
    }

    let n = suppliers.len() as f64;
    let avg_rating = if n > 0.0 { rating_sum / n } else { 0.0 };

    Ok(SupplierPerformanceReport {
        total_suppliers: suppliers.len() as i64,
        total_spend: total_spend_all,
        avg_rating,
        suppliers,
    })
}

#[derive(Serialize)]
pub struct DashboardData {
    pub total_revenue: f64,
    pub total_sales: i64,
    pub total_products: i64,
    pub low_stock_count: i64,
    pub revenue_2025: Vec<f64>,
    pub revenue_2024: Vec<f64>,
    pub category_distribution: Vec<CategorySales>,
    pub weekly_sales: Vec<f64>,
    pub weekly_target: f64,
    pub recent_orders: Vec<RecentOrder>,
    pub low_stock_items: Vec<LowStockItem>,
    pub quick_stats: QuickStats,
}

#[derive(Serialize)]
pub struct RecentOrder {
    pub receipt_no: String,
    pub customer_name: String,
    pub items: i64,
    pub total: f64,
    pub status: String,
    pub sold_at: String,
}

#[derive(Serialize)]
pub struct LowStockItem {
    pub product_id: String,
    pub name: String,
    pub sku: String,
    pub stock: f64,
    pub reorder_level: i64,
}

#[derive(Serialize)]
pub struct QuickStats {
    pub today_sales_count: i64,
    pub today_revenue: f64,
    pub avg_order_value: f64,
    pub active_customers: i64,
}

#[tauri::command]
pub async fn report_dashboard(
    pool: tauri::State<'_, SqlitePool>,
) -> Result<DashboardData, String> {
    // KPI: total revenue (all time)
    let total_revenue: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total), 0.0) FROM sales WHERE status NOT IN ('void','refunded')"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let total_sales: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sales WHERE status NOT IN ('void','refunded')"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let total_products: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM products WHERE is_active = 1"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    // Low stock = stock > 0 AND stock <= reorder_level
    let low_stock_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM products p
         WHERE p.is_active = 1
         AND COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) > 0
         AND COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) <= p.reorder_level"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    // Monthly revenue for current and previous year
    let current_year = chrono::Utc::now().format("%Y").to_string();
    let previous_year = (chrono::Utc::now().format("%Y").to_string().parse::<i32>().unwrap_or(2025) - 1).to_string();

    let mut revenue_2025 = vec![0.0_f64; 12];
    let mut revenue_2024 = vec![0.0_f64; 12];

    for (label, vec) in [(&current_year, &mut revenue_2025), (&previous_year, &mut revenue_2024)] {
        let rows = sqlx::query(
            "SELECT CAST(strftime('%m', sold_at) AS INTEGER) AS m,
                    COALESCE(SUM(total), 0.0) AS rev
             FROM sales
             WHERE strftime('%Y', sold_at) = ? AND status NOT IN ('void','refunded')
             GROUP BY m"
        ).bind(label).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

        for r in rows {
            let m: i64 = r.get("m");
            let rev: f64 = r.get("rev");
            if m >= 1 && m <= 12 { vec[(m - 1) as usize] = rev; }
        }
    }

    // Category distribution
    let cat_rows = sqlx::query(
        "SELECT COALESCE(c.name, 'Uncategorised') AS cat_name,
                COALESCE(SUM(si.line_total), 0.0) AS revenue,
                COALESCE(SUM(si.quantity), 0.0) AS units
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         LEFT JOIN products p ON p.id = si.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE s.status NOT IN ('void','refunded')
         GROUP BY p.category_id
         ORDER BY revenue DESC
         LIMIT 6"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let category_distribution: Vec<CategorySales> = cat_rows.into_iter().map(|r| CategorySales {
        category_id: None,
        category_name: r.get("cat_name"),
        revenue: r.get("revenue"),
        units: r.get("units"),
    }).collect();

    // Weekly sales — last 7 days from today
    let mut weekly_sales = vec![0.0_f64; 7];
    let weekly_rows = sqlx::query(
        "SELECT date(sold_at) AS d, COALESCE(SUM(total), 0.0) AS rev
         FROM sales
         WHERE date(sold_at) >= date('now', '-6 days') AND status NOT IN ('void','refunded')
         GROUP BY d"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let today = chrono::Utc::now().date_naive();
    for r in weekly_rows {
        let d_str: String = r.get("d");
        if let Ok(d) = chrono::NaiveDate::parse_from_str(&d_str, "%Y-%m-%d") {
            let diff = (today - d).num_days();
            if diff >= 0 && diff < 7 {
                weekly_sales[(6 - diff) as usize] = r.get::<f64, _>("rev");
            }
        }
    }

    // Weekly target — sum from sales_targets if exists, else default
    let weekly_target: f64 = sqlx::query_scalar(
        "SELECT COALESCE(target_amount, 0.0) FROM sales_targets
         WHERE period_type = 'weekly' AND date(period_start) <= date('now') AND date(period_end) >= date('now')
         LIMIT 1"
    ).fetch_optional(&*pool).await.ok().flatten().unwrap_or(0.0);

    // Recent orders
    let recent = sqlx::query(
        "SELECT s.receipt_no, c.name AS customer_name, s.total, s.status, s.sold_at,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) AS items
         FROM sales s
         LEFT JOIN customers c ON c.id = s.customer_id
         ORDER BY s.sold_at DESC
         LIMIT 6"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let recent_orders: Vec<RecentOrder> = recent.into_iter().map(|r| RecentOrder {
        receipt_no: r.get("receipt_no"),
        customer_name: r.get::<Option<String>, _>("customer_name").unwrap_or_else(|| "Walk-in".into()),
        items: r.get("items"),
        total: r.get("total"),
        status: r.get("status"),
        sold_at: r.get("sold_at"),
    }).collect();

    // Low stock items (top 5)
    let ls = sqlx::query(
        "SELECT p.id, p.name, p.sku, p.reorder_level,
                COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) AS stock
         FROM products p
         WHERE p.is_active = 1
         AND COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) > 0
         AND COALESCE((SELECT SUM(quantity) FROM inventory_stock WHERE product_id = p.id), 0.0) <= p.reorder_level
         ORDER BY stock ASC
         LIMIT 5"
    ).fetch_all(&*pool).await.map_err(|e| e.to_string())?;

    let low_stock_items: Vec<LowStockItem> = ls.into_iter().map(|r| LowStockItem {
        product_id: r.get("id"),
        name: r.get("name"),
        sku: r.get("sku"),
        stock: r.get("stock"),
        reorder_level: r.get("reorder_level"),
    }).collect();

    // Quick stats — today
    let today_sales_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sales WHERE date(sold_at) = date('now') AND status NOT IN ('void','refunded')"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let today_revenue: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total), 0.0) FROM sales WHERE date(sold_at) = date('now') AND status NOT IN ('void','refunded')"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let avg_order_value: f64 = sqlx::query_scalar(
        "SELECT COALESCE(AVG(total), 0.0) FROM sales WHERE status NOT IN ('void','refunded')"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    let active_customers: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM customers WHERE status = 'active'"
    ).fetch_one(&*pool).await.map_err(|e| e.to_string())?;

    Ok(DashboardData {
        total_revenue,
        total_sales,
        total_products,
        low_stock_count,
        revenue_2025,
        revenue_2024,
        category_distribution,
        weekly_sales,
        weekly_target,
        recent_orders,
        low_stock_items,
        quick_stats: QuickStats {
            today_sales_count,
            today_revenue,
            avg_order_value,
            active_customers,
        },
    })
}
