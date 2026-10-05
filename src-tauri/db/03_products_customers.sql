CREATE TABLE IF NOT EXISTS categories (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    parent_id       TEXT REFERENCES categories(id) ON DELETE SET NULL,
    description     TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cat_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS brands (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units_of_measure (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,
    sku             TEXT NOT NULL UNIQUE,
    barcode         TEXT,
    name            TEXT NOT NULL,
    description     TEXT,
    category_id     TEXT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id        TEXT REFERENCES brands(id) ON DELETE SET NULL,
    unit_id         TEXT REFERENCES units_of_measure(id) ON DELETE SET NULL,
    cost_price      REAL NOT NULL DEFAULT 0,
    sell_price      REAL NOT NULL DEFAULT 0,
    reorder_level   INTEGER NOT NULL DEFAULT 0,
    shelf_location  TEXT,
    weight_kg       REAL,
    dimensions      TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prod_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_prod_brand    ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_prod_barcode  ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_prod_active   ON products(is_active);

CREATE TABLE IF NOT EXISTS product_variants (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    sku             TEXT UNIQUE,
    barcode         TEXT,
    cost_price      REAL,
    sell_price      REAL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_var_product ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS product_images (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file_path       TEXT NOT NULL,
    is_primary      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_img_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS warehouses (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    location        TEXT,
    manager         TEXT,
    phone           TEXT,
    email           TEXT,
    capacity        TEXT,
    is_default      INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','maintenance','inactive')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wh_status ON warehouses(status);

CREATE TABLE IF NOT EXISTS warehouse_locations (
    id              TEXT PRIMARY KEY,
    warehouse_id    TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (warehouse_id, code)
);
CREATE INDEX IF NOT EXISTS idx_whloc_wh ON warehouse_locations(warehouse_id);

CREATE TABLE IF NOT EXISTS suppliers (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    contact_name    TEXT,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    payment_terms   TEXT,
    rating          REAL DEFAULT 0,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sup_active ON suppliers(is_active);

CREATE TABLE IF NOT EXISTS product_suppliers (
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id     TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku    TEXT,
    cost_price      REAL,
    is_preferred    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, supplier_id)
);
CREATE INDEX IF NOT EXISTS idx_psup_sup ON product_suppliers(supplier_id);

CREATE TABLE IF NOT EXISTS supplier_ledger (
    id              TEXT PRIMARY KEY,
    supplier_id     TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    entry_type      TEXT NOT NULL CHECK (entry_type IN ('debit','credit')),
    amount          REAL NOT NULL,
    reference       TEXT,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_supldg_sup  ON supplier_ledger(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supldg_time ON supplier_ledger(created_at);

CREATE TABLE IF NOT EXISTS inventory_stock (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id    TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity        REAL NOT NULL DEFAULT 0,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (product_id, variant_id, warehouse_id)
);
CREATE INDEX IF NOT EXISTS idx_stock_product ON inventory_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_wh      ON inventory_stock(warehouse_id);

CREATE TABLE IF NOT EXISTS stock_batches (
    id              TEXT PRIMARY KEY,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id    TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_no        TEXT,
    quantity        REAL NOT NULL DEFAULT 0,
    manufacture_date TEXT,
    expiry_date     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_batch_product ON stock_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_expiry  ON stock_batches(expiry_date);

CREATE TABLE IF NOT EXISTS stock_adjustments (
    id              TEXT PRIMARY KEY,
    warehouse_id    TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    notes           TEXT,
    adjusted_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_adj_wh   ON stock_adjustments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_adj_time ON stock_adjustments(created_at);

CREATE TABLE IF NOT EXISTS stock_adjustment_items (
    id              TEXT PRIMARY KEY,
    adjustment_id   TEXT NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    direction       TEXT NOT NULL CHECK (direction IN ('add','remove')),
    quantity        REAL NOT NULL,
    reason          TEXT
);
CREATE INDEX IF NOT EXISTS idx_adjitem_adj ON stock_adjustment_items(adjustment_id);

CREATE TABLE IF NOT EXISTS stock_transfers (
    id              TEXT PRIMARY KEY,
    from_warehouse  TEXT NOT NULL REFERENCES warehouses(id),
    to_warehouse    TEXT NOT NULL REFERENCES warehouses(id),
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_progress','completed','cancelled')),
    transferred_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_tr_from   ON stock_transfers(from_warehouse);
CREATE INDEX IF NOT EXISTS idx_tr_to     ON stock_transfers(to_warehouse);
CREATE INDEX IF NOT EXISTS idx_tr_status ON stock_transfers(status);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id              TEXT PRIMARY KEY,
    transfer_id     TEXT NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id),
    variant_id      TEXT REFERENCES product_variants(id),
    quantity        REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tritem_tr ON stock_transfer_items(transfer_id);

CREATE TABLE IF NOT EXISTS customers (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    zip_code        TEXT,
    country         TEXT,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive')),
    notes           TEXT,
    joined_at       TEXT NOT NULL DEFAULT (datetime('now')),
    last_purchase_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_cust_phone  ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_cust_email  ON customers(email);
CREATE INDEX IF NOT EXISTS idx_cust_status ON customers(status);

CREATE TABLE IF NOT EXISTS customer_groups (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    discount_pct    REAL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customer_group_members (
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    group_id        TEXT NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, group_id)
);

CREATE TABLE IF NOT EXISTS customer_ledger (
    id              TEXT PRIMARY KEY,
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    entry_type      TEXT NOT NULL CHECK (entry_type IN ('debit','credit')),
    amount          REAL NOT NULL,
    reference       TEXT,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_custldg_cust ON customer_ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_custldg_time ON customer_ledger(created_at);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id              TEXT PRIMARY KEY,
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points          REAL NOT NULL,
    entry_type      TEXT NOT NULL CHECK (entry_type IN ('earn','redeem','adjust')),
    reference       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_loyal_cust ON loyalty_points(customer_id);

CREATE TABLE IF NOT EXISTS customer_notes (
    id              TEXT PRIMARY KEY,
    customer_id     TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note            TEXT NOT NULL,
    created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cnote_cust ON customer_notes(customer_id);
