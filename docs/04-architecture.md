# 4. Architecture

Tauri Desktop App runs on client machine:

- React Frontend (UI only)
- Rust Backend (DB, files, printing, license, backup, updater)
- Local SQLite DB
- Only during 1-hour online window -> pings License/Update Server

## Your Server

Cloudflare Workers + R2 + Backblaze B2:
- License verification
- Update distribution
- Backup storage

## Key Principle

No server runs on the client machine. Rust inside Tauri IS the backend.
React never touches SQLite directly.
