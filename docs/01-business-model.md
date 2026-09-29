# 1. Business Model

A **desktop-first** POS and inventory management system for small-to-medium retail shops in Kenya.

**Owner:** Syntelsafe
**Author:** Jeff Masinde

## Three Client Types

All three use the same codebase and installer. Only the license tier differs.

| Tier | How it works | Client pays | Enforcement |
|---|---|---|---|
| **One-Time Purchase** | Client pays full price once. Owns forever. | Full amount at signup | License marked one-time; no further checks |
| **Rent-to-Own** | Fixed monthly amount for fixed duration. Then owns. | Monthly until fully paid | App tracks progress; unlocks permanently when complete |
| **Subscription** | Monthly indefinitely. Includes maintenance, backups, updates. | Monthly forever | Scheduled online license check |

## Why Desktop, Not Web

- No hosting bills for the client
- Works offline
- Client feels ownership
- Your cost: ~KSH 0-650/month total
- Client data stays on their disk
- Updates pushed silently

## Operating Costs

| Item | Cost |
|---|---|
| License / update server (Cloudflare) | ~KSH 0-100/mo |
| Cloud backups (Backblaze B2) | ~KSH 80/mo per 20 clients |
| Domain name | ~KSH 120/mo |
| **Total at 20 clients** | **~KSH 200-650/mo** |

## Sample Revenue (20 Clients)

| Tier | Clients | Price | Monthly |
|---|---|---|---|
| One-time | 5 | KSH 45,000 one-off | - |
| Rent-to-own | 10 | KSH 3,000 x 12 | KSH 30,000 |
| Subscription | 5 | KSH 1,500/mo | KSH 7,500 |
| **Monthly recurring** | | | **~KSH 37,500** |
