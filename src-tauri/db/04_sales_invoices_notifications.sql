-- ============================================================
-- 04 — Purchases, Sales, Invoices, Notifications, Reports (UUID)
-- ============================================================

-- ---------- Purchase Orders ----------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              TEXT PRIMARY KEY,
    po_number       TEXT NOT NULL UNIQUE,
    supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','shipped','received','cancelled')),
    order_date      TEXT NOT NULL DEFAULT (date('now')),
    expected_date   TEXT,
    notes           TEXT,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_po_sup    ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_date   ON purchase_orders(order_date);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id              TEXT PRIMARY KEY,
    po_id           TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_cost       REAL NOT NULL,
    received_qty    REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_poitem_po      ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_poitem_product ON purchase_order_items(product_id);

CREATE TABLE IF NOT EXISTS goods_received_notes (
    id              TEXT PRIMARY KEY,
    grn_number      TEXT NOT NULL UNIQUE,
    po_id           TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    warehouse_id    TEXT REFERENCES warehouses(id),
    received_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
    received_at     TEXT NOT NULL DEFAULT (datetime('now')),
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_grn_po ON goods_received_notes(po_id);

CREATE TABLE IF NOT EXISTS goods_received_items (
    id              TEXT PRIMARY KEY,
    grn_id          TEXT NOT NULL REFERENCES goods_received_notes(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_cost       REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_grnitem_grn ON goods_received_items(grn_id);

CREATE TABLE IF NOT EXISTS purchase_returns (
    id              TEXT PRIMARY KEY,
    return_number   TEXT NOT NULL UNIQUE,
    supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
    po_id           TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    reason          TEXT,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pret_sup ON purchase_returns(supplier_id);

CREATE TABLE IF NOT EXISTS purchase_return_items (
    id              TEXT PRIMARY KEY,
    return_id       TEXT NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_cost       REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pretitem_ret ON purchase_return_items(return_id);

-- ---------- POS Sessions & Held Orders ----------
CREATE TABLE IF NOT EXISTS pos_sessions (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opened_at       TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at       TEXT,
    opening_cash    REAL NOT NULL DEFAULT 0,
    closing_cash    REAL,
    expected_cash   REAL,
    difference      REAL,
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_posses_user   ON pos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posses_opened ON pos_sessions(opened_at);

CREATE TABLE IF NOT EXISTS held_orders (
    id              TEXT PRIMARY KEY,
    reference       TEXT NOT NULL,
    customer_id     TEXT REFERENCES customers(id) ON DELETE SET NULL,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_held_user ON held_orders(user_id);

CREATE TABLE IF NOT EXISTS held_order_items (
    id              TEXT PRIMARY KEY,
    held_id         TEXT NOT NULL REFERENCES held_orders(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_price      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_helditem_held ON held_order_items(held_id);

-- ---------- Sales ----------
CREATE TABLE IF NOT EXISTS sales (
    id              TEXT PRIMARY KEY,
    receipt_no      TEXT NOT NULL UNIQUE,
    customer_id     TEXT REFERENCES customers(id) ON DELETE SET NULL,
    session_id      TEXT REFERENCES pos_sessions(id) ON DELETE SET NULL,
    cashier_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
    warehouse_id    TEXT REFERENCES warehouses(id),
    subtotal        REAL NOT NULL DEFAULT 0,
    discount_amount REAL NOT NULL DEFAULT 0,
    total           REAL NOT NULL DEFAULT 0,
    amount_paid     REAL NOT NULL DEFAULT 0,
    change_due      REAL NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'completed'
                    CHECK (status IN ('completed','pending','void','refunded','processing')),
    sold_at         TEXT NOT NULL DEFAULT (datetime('now')),
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_sale_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_cashier  ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sale_time     ON sales(sold_at);
CREATE INDEX IF NOT EXISTS idx_sale_status   ON sales(status);

CREATE TABLE IF NOT EXISTS sale_items (
    id              TEXT PRIMARY KEY,
    sale_id         TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_price      REAL NOT NULL,
    discount        REAL NOT NULL DEFAULT 0,
    line_total      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_saleitem_sale    ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_saleitem_product ON sale_items(product_id);

CREATE TABLE IF NOT EXISTS sale_payments (
    id              TEXT PRIMARY KEY,
    sale_id         TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method          TEXT NOT NULL CHECK (method IN ('cash','card','mobile','bank','other')),
    amount          REAL NOT NULL,
    reference       TEXT,
    paid_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_salepay_sale ON sale_payments(sale_id);

CREATE TABLE IF NOT EXISTS sale_returns (
    id              TEXT PRIMARY KEY,
    return_number   TEXT NOT NULL UNIQUE,
    sale_id         TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    customer_id     TEXT REFERENCES customers(id) ON DELETE SET NULL,
    reason          TEXT,
    refund_method   TEXT CHECK (refund_method IN ('cash','card','mobile','bank','credit')),
    refund_amount   REAL NOT NULL DEFAULT 0,
    stock_disposition TEXT NOT NULL DEFAULT 'restock' CHECK (stock_disposition IN ('restock','write_off')),
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','processing','completed')),
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sret_sale   ON sale_returns(sale_id);
CREATE INDEX IF NOT EXISTS idx_sret_status ON sale_returns(status);

CREATE TABLE IF NOT EXISTS sale_return_items (
    id              TEXT PRIMARY KEY,
    return_id       TEXT NOT NULL REFERENCES sale_returns(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL,
    unit_price      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sretitem_ret ON sale_return_items(return_id);

-- ---------- Invoices ----------
CREATE TABLE IF NOT EXISTS invoice_settings (
    id              TEXT PRIMARY KEY,
    company_name    TEXT,
    company_address TEXT,
    company_phone   TEXT,
    company_email   TEXT,
    company_website TEXT,
    logo_path       TEXT,
    currency        TEXT NOT NULL DEFAULT 'KES',
    invoice_prefix  TEXT NOT NULL DEFAULT 'INV',
    next_number     INTEGER NOT NULL DEFAULT 1,
    payment_terms   TEXT,
    footer_text     TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
    id              TEXT PRIMARY KEY,
    invoice_no      TEXT NOT NULL UNIQUE,
    customer_id     TEXT REFERENCES customers(id) ON DELETE SET NULL,
    sale_id         TEXT REFERENCES sales(id) ON DELETE SET NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','unpaid','overdue','void')),
    issue_date      TEXT NOT NULL DEFAULT (date('now')),
    due_date        TEXT,
    subtotal        REAL NOT NULL DEFAULT 0,
    discount_amount REAL NOT NULL DEFAULT 0,
    total           REAL NOT NULL DEFAULT 0,
    amount_paid     REAL NOT NULL DEFAULT 0,
    notes           TEXT,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inv_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_inv_status   ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_inv_due      ON invoices(due_date);

CREATE TABLE IF NOT EXISTS invoice_items (
    id              TEXT PRIMARY KEY,
    invoice_id      TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id      TEXT REFERENCES products(id) ON DELETE SET NULL,
    description     TEXT,
    quantity        REAL NOT NULL,
    unit_price      REAL NOT NULL,
    line_total      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invitem_inv ON invoice_items(invoice_id);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id              TEXT PRIMARY KEY,
    invoice_id      TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount          REAL NOT NULL,
    method          TEXT CHECK (method IN ('cash','card','mobile','bank','other')),
    reference       TEXT,
    paid_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invpay_inv ON invoice_payments(invoice_id);

-- ---------- Notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
    id              TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    message         TEXT,
    link            TEXT,
    is_read         INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);

CREATE TABLE IF NOT EXISTS notification_templates (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    channel         TEXT NOT NULL CHECK (channel IN ('in_app','email','sms')),
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expiry_alerts (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_id        TEXT REFERENCES stock_batches(id) ON DELETE CASCADE,
    expiry_date     TEXT NOT NULL,
    days_remaining  INTEGER,
    is_dismissed    INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_expiry_product ON expiry_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_expiry_date    ON expiry_alerts(expiry_date);

CREATE TABLE IF NOT EXISTS reorder_suggestions (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock   REAL NOT NULL,
    suggested_qty   REAL NOT NULL,
    reason          TEXT,
    is_resolved     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reorder_product ON reorder_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_reorder_resolved ON reorder_suggestions(is_resolved);

-- ---------- Reports (materialized) ----------
CREATE TABLE IF NOT EXISTS daily_sales_summary (
    id              TEXT PRIMARY KEY,
    summary_date    TEXT NOT NULL UNIQUE,
    total_sales     INTEGER NOT NULL DEFAULT 0,
    total_revenue   REAL NOT NULL DEFAULT 0,
    total_discount  REAL NOT NULL DEFAULT 0,
    total_cost      REAL NOT NULL DEFAULT 0,
    gross_profit    REAL NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dss_date ON daily_sales_summary(summary_date);

CREATE TABLE IF NOT EXISTS period_reports (
    id              TEXT PRIMARY KEY,
    period_type     TEXT NOT NULL CHECK (period_type IN ('weekly','monthly','yearly')),
    period_start    TEXT NOT NULL,
    period_end      TEXT NOT NULL,
    total_sales     INTEGER NOT NULL DEFAULT 0,
    total_revenue   REAL NOT NULL DEFAULT 0,
    total_profit    REAL NOT NULL DEFAULT 0,
    new_customers   INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (period_type, period_start, period_end)
);
CREATE INDEX IF NOT EXISTS idx_pr_type  ON period_reports(period_type);
CREATE INDEX IF NOT EXISTS idx_pr_start ON period_reports(period_start);

CREATE TABLE IF NOT EXISTS top_products (
    id              TEXT PRIMARY KEY,
    period_type     TEXT NOT NULL CHECK (period_type IN ('weekly','monthly','yearly')),
    period_start    TEXT NOT NULL,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    units_sold      REAL NOT NULL DEFAULT 0,
    revenue         REAL NOT NULL DEFAULT 0,
    rank            INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_top_product ON top_products(product_id);
CREATE INDEX IF NOT EXISTS idx_top_period  ON top_products(period_type, period_start);
