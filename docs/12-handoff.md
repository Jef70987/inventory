# 12. Notes for the Next Developer

Read docs/ in numeric order. Understand business model first, then architecture, then code.

## Key Facts

1. Frontend is a prototype — data is hardcoded, no DB wired
2. React pages in src/pages/ — one folder per module
3. Rust backend in src-tauri/src/ — empty scaffold
4. Next milestone: SQLite — design schema, wire into Rust, prove one command
5. Do NOT add a server — backend is Rust inside Tauri
6. Do NOT use Django, Supabase, or any cloud DB
7. Do NOT use django-tenants — single-tenant SQLite per client
8. RBAC: permissions predefined, groups admin-created
9. Rust is the backend — React never touches DB directly

## Pitfalls

- Don't run npx tauri dev from Snap terminal without unsetting GTK_PATH and GIO_MODULE_DIR
- Don't add supabase module to configs
- Don't put logic in React that belongs in Rust
- Don't hardcode license keys or permissions in components

## Run Dev

cd ~/syntelsafe/inventory/inventory-app
tauri-dev

## Build

npx tauri build
Output: src-tauri/target/release/bundle/
