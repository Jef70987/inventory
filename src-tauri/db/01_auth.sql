PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    username        TEXT NOT NULL UNIQUE,
    email           TEXT,
    phone           TEXT,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')),
    is_superuser    INTEGER NOT NULL DEFAULT 0,
    last_login_at   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);

CREATE TABLE IF NOT EXISTS users_profile (
    user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    avatar_path     TEXT,
    address         TEXT,
    date_of_birth   TEXT,
    notes           TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token   TEXT NOT NULL UNIQUE,
    device          TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    revoked_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS access_tokens (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    issued_at       TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    revoked_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_access_user  ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_token ON access_tokens(token);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    issued_at       TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    revoked_at      TEXT,
    rotated_from    TEXT REFERENCES refresh_tokens(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_refresh_user  ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS password_resets (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    channel         TEXT NOT NULL CHECK (channel IN ('email','sms')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    used_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_pwreset_user  ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_pwreset_token ON password_resets(token);

CREATE TABLE IF NOT EXISTS otp_codes (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,
    purpose         TEXT NOT NULL CHECK (purpose IN ('reset','login','2fa')),
    channel         TEXT NOT NULL CHECK (channel IN ('email','sms')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at      TEXT NOT NULL,
    used_at         TEXT,
    attempts        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_otp_user    ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_purpose ON otp_codes(purpose);

CREATE TABLE IF NOT EXISTS permissions (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    module          TEXT NOT NULL,
    label           TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_perm_module ON permissions(module);

CREATE TABLE IF NOT EXISTS groups (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    is_system       INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_permissions (
    group_id        TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    permission_id   TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, permission_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_permission ON group_permissions(permission_id);

CREATE TABLE IF NOT EXISTS user_groups (
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id        TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_ug_group ON user_groups(group_id);

CREATE TABLE IF NOT EXISTS audit_log (
    id              TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
    module          TEXT NOT NULL,
    action          TEXT NOT NULL,
    target_table    TEXT,
    target_id       TEXT,
    details         TEXT,
    ip_address      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_time   ON audit_log(created_at);

CREATE TABLE IF NOT EXISTS login_attempts (
    id              TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
    username_tried  TEXT,
    ip_address      TEXT,
    success         INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_user ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_time ON login_attempts(created_at);

CREATE TABLE IF NOT EXISTS system_events (
    id              TEXT PRIMARY KEY,
    level           TEXT NOT NULL CHECK (level IN ('info','warning','error')),
    message         TEXT NOT NULL,
    context         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sysevent_level ON system_events(level);
CREATE INDEX IF NOT EXISTS idx_sysevent_time  ON system_events(created_at);
