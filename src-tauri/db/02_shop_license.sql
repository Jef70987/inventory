CREATE TABLE IF NOT EXISTS shop_config (
    id              TEXT PRIMARY KEY,
    shop_name       TEXT NOT NULL,
    shop_type       TEXT,
    location        TEXT,
    owner_name      TEXT,
    owner_phone     TEXT,
    owner_email     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_settings (
    id              TEXT PRIMARY KEY,
    currency_code   TEXT NOT NULL DEFAULT 'KES',
    currency_symbol TEXT NOT NULL DEFAULT 'KSH',
    receipt_prefix  TEXT NOT NULL DEFAULT 'INV',
    invoice_prefix  TEXT NOT NULL DEFAULT 'INV',
    next_receipt_no INTEGER NOT NULL DEFAULT 1,
    next_invoice_no INTEGER NOT NULL DEFAULT 1,
    receipt_footer  TEXT,
    logo_path       TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS backups_log (
    id              TEXT PRIMARY KEY,
    file_path       TEXT,
    file_size       INTEGER,
    uploaded_to     TEXT,
    status          TEXT NOT NULL CHECK (status IN ('pending','uploaded','failed')),
    error_message   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_backup_status ON backups_log(status);
CREATE INDEX IF NOT EXISTS idx_backup_time   ON backups_log(created_at);

CREATE TABLE IF NOT EXISTS license_categories (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    billing_type    TEXT NOT NULL CHECK (billing_type IN ('one_time','rent_to_own','subscription')),
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS license_plans (
    id              TEXT PRIMARY KEY,
    category_id     TEXT NOT NULL REFERENCES license_categories(id) ON DELETE CASCADE,
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KES',
    total_amount    REAL,
    monthly_amount  REAL,
    duration_months INTEGER,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_plan_category ON license_plans(category_id);

CREATE TABLE IF NOT EXISTS licenses (
    id              TEXT PRIMARY KEY,
    license_key     TEXT NOT NULL UNIQUE,
    plan_id         TEXT NOT NULL REFERENCES license_plans(id),
    category_id     TEXT NOT NULL REFERENCES license_categories(id),
    shop_config_id  TEXT REFERENCES shop_config(id) ON DELETE SET NULL,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','grace','overdue','locked','owned','expired','revoked')),
    activated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT,
    owned_at        TEXT,
    last_check_at   TEXT,
    next_check_at   TEXT,
    grace_days      INTEGER NOT NULL DEFAULT 7,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lic_status     ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_lic_next_check ON licenses(next_check_at);
CREATE INDEX IF NOT EXISTS idx_lic_key        ON licenses(license_key);

CREATE TABLE IF NOT EXISTS license_payments (
    id              TEXT PRIMARY KEY,
    license_id      TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KES',
    method          TEXT NOT NULL CHECK (method IN ('cash','mpesa','bank','card','other')),
    reference       TEXT,
    period_start    TEXT,
    period_end      TEXT,
    recorded_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    paid_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_licpay_license ON license_payments(license_id);
CREATE INDEX IF NOT EXISTS idx_licpay_date    ON license_payments(paid_at);

CREATE TABLE IF NOT EXISTS license_schedule (
    id              TEXT PRIMARY KEY,
    license_id      TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    due_date        TEXT NOT NULL,
    amount_due      REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KES',
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','partial','overdue','cancelled')),
    paid_amount     REAL NOT NULL DEFAULT 0,
    paid_at         TEXT,
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_sched_license ON license_schedule(license_id);
CREATE INDEX IF NOT EXISTS idx_sched_due     ON license_schedule(due_date);
CREATE INDEX IF NOT EXISTS idx_sched_status  ON license_schedule(status);

CREATE TABLE IF NOT EXISTS license_checks (
    id              TEXT PRIMARY KEY,
    license_id      TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    checked_at      TEXT NOT NULL DEFAULT (datetime('now')),
    success         INTEGER NOT NULL DEFAULT 0,
    response_code   TEXT,
    message         TEXT
);
CREATE INDEX IF NOT EXISTS idx_liccheck_license ON license_checks(license_id);
CREATE INDEX IF NOT EXISTS idx_liccheck_time    ON license_checks(checked_at);

CREATE TABLE IF NOT EXISTS license_status_log (
    id              TEXT PRIMARY KEY,
    license_id      TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    reason          TEXT,
    changed_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    changed_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_licstat_license ON license_status_log(license_id);
CREATE INDEX IF NOT EXISTS idx_licstat_time    ON license_status_log(changed_at);
