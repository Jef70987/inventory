# 3. Tech Stack

## Frontend
- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- Lucide React
- Chart.js 4 + react-chartjs-2

## Desktop Shell
- Tauri 2
- Rust 1.98
- WebView2 / WebKitGTK / WKWebView

## Backend (Inside Tauri)
- Rust — all backend logic
- SQLite — local DB per client
- SQLx or Rusqlite
- Tauri commands (invoke) bridge React <-> Rust

## Auth & Licensing
- Custom RBAC (Django-style)
- License server on Cloudflare Workers
- Signed update manifests
- Local SQLite for users, groups, permissions, sessions

## Deployment
- One build per OS (.deb, .AppImage, .msi, .dmg)
- Auto-update channel on Cloudflare R2 or GitHub Releases
- No per-client hosting
