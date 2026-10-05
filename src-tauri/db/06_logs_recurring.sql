-- ============================================================
-- 06 — Logs & Recurring Invoices (UUID)
-- ============================================================

-- ---------- Stock Movements (unified ledger) ----------
CREATE TABLE IF NOT EXISTS stock_movements (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id    TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type   TEXT NOT NULL CHECK (movement_type IN
                    ('sale','sale_return','purchase','purchase_return',
                     'adjustment','transfer_in','transfer_out','initial')),
    quantity        REAL NOT NULL,
    unit_cost       REAL,
    reference_table TEXT,
    reference_id    TEXT,
    notes           TEXT,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_move_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_move_wh      ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_move_type    ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_move_time    ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_move_ref     ON stock_movements(reference_table, reference_id);

-- ---------- Bulk Import Logs ----------
CREATE TABLE IF NOT EXISTS bulk_import_logs (
    id              TEXT PRIMARY KEY,
    file_name       TEXT NOT NULL,
    file_size       INTEGER,
    total_rows      INTEGER NOT NULL DEFAULT 0,
    success_rows    INTEGER NOT NULL DEFAULT 0,
    failed_rows     INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','failed')),
    error_details   TEXT,
    imported_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_bulk_status ON bulk_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_user   ON bulk_import_logs(imported_by);
CREATE INDEX IF NOT EXISTS idx_bulk_time   ON bulk_import_logs(started_at);

-- ---------- Recurring Invoices ----------
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id              TEXT PRIMARY KEY,
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    template_name   TEXT NOT NULL,
    frequency       TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','quarterly','yearly')),
    next_run_date   TEXT NOT NULL,
    last_run_date   TEXT,
    end_date        TEXT,
    subtotal        REAL NOT NULL DEFAULT 0,
    discount_amount REAL NOT NULL DEFAULT 0,
    total           REAL NOT NULL DEFAULT 0,
    notes           TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rec_customer ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_rec_next     ON recurring_invoices(next_run_date);
CREATE INDEX IF NOT EXISTS idx_rec_active   ON recurring_invoices(is_active);

CREATE TABLE IF NOT EXISTS recurring_invoice_items (
    id              TEXT PRIMARY KEY,
    recurring_id    TEXT NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    product_id      TEXT REFERENCES products(id) ON DELETE SET NULL,
    description     TEXT,
    quantity        REAL NOT NULL,
    unit_price      REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recitem_rec ON recurring_invoice_items(recurring_id);
