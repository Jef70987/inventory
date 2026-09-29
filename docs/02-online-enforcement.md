# 2. Online Enforcement Model

App works offline normally, but **must connect to the internet for 1 hour, twice a week** (window TBD).

## During That Window

1. License check — verify subscription is active
2. Cloud backup — push a copy of the DB to your servers
3. Updates — check for and pull new versions

## Failure Handling

- Missed check -> grace period -> app locks
- Your server down -> app keeps working (fail-open); client contacts support
- Backups encrypted before upload; recovery key held by client

## Backup Retention

- Keep last 4 backups (2 weeks)
- Weekly archive kept 3 months
- Monthly archive kept 1 year
- Older restores on demand
