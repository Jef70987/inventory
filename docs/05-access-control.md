# 5. Access Control (Django-Style)

Permissions predefined. Groups admin-created.

## Tables

- permissions (predefined actions)
- groups (admin creates freely)
- group_permissions (M2M)
- users
- user_groups (M2M)

Middleware checks on every route if user's groups include required permission.

No hardcoded roles in code.

## Predefined Permissions

- Sales: sales.pos, sales.view_own, sales.view_all, sales.refund, sales.void, sales.discount, sales.discount_override
- Inventory: inventory.view, inventory.create, inventory.edit, inventory.delete, inventory.adjust_stock, inventory.bulk_import
- Customers: customers.view, customers.create, customers.edit, customers.delete
- Purchases: purchases.view, purchases.create, purchases.receive, purchases.approve
- Invoices: invoices.view, invoices.create, invoices.edit, invoices.settings
- Reports: reports.sales, reports.inventory, reports.financial, reports.export
- Users: users.view, users.create, users.edit, users.delete, users.groups, users.permissions
- System: system.settings, system.backup, system.restore, system.license, system.api_keys
