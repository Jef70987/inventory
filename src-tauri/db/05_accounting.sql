-- ============================================================
-- 05 — Accounting: Expenses & Sales Targets (UUID)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------- Expenses ----------
CREATE TABLE IF NOT EXISTS expense_categories (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
    id              TEXT PRIMARY KEY,
    category_id     TEXT REFERENCES expense_categories(id) ON DELETE SET NULL,
    description     TEXT NOT NULL,
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KES',
    expense_type    TEXT NOT NULL CHECK (expense_type IN ('cogs','operating','other')),
    payment_method  TEXT CHECK (payment_method IN ('cash','mpesa','bank','card','other')),
    reference       TEXT,
    incurred_on     TEXT NOT NULL DEFAULT (date('now')),
    recorded_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_exp_cat      ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_exp_type     ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_exp_date     ON expenses(incurred_on);
CREATE INDEX IF NOT EXISTS idx_exp_recorded ON expenses(recorded_by);

-- ---------- Sales Targets ----------
CREATE TABLE IF NOT EXISTS sales_targets (
    id              TEXT PRIMARY KEY,
    period_type     TEXT NOT NULL CHECK (period_type IN ('daily','weekly','monthly','yearly')),
    period_start    TEXT NOT NULL,
    period_end      TEXT NOT NULL,
    target_amount   REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'KES',
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (period_type, period_start, period_end)
);
CREATE INDEX IF NOT EXISTS idx_target_type  ON sales_targets(period_type);
CREATE INDEX IF NOT EXISTS idx_target_start ON sales_targets(period_start);
