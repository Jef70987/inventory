# 8. Database Schema (Planned)

SQLite. One file per client.

## Users & Access
permissions, groups, group_permissions, users, user_groups, audit_log, sessions

## Shop & System
shop_config, store_settings, license, backups_log

## Products & Inventory
categories, brands, units_of_measure, products, product_variants, product_images, product_suppliers, inventory_stock, stock_batches, stock_adjustments, stock_transfers

## Customers & Suppliers
customers, customer_groups, suppliers, supplier_ledger

## Purchases
purchase_orders, purchase_order_items, goods_received_notes, goods_received_items, purchase_returns

## Sales & POS
sales, sale_items, sale_payments, sale_returns, pos_sessions, held_orders

## Invoices
invoices, invoice_items, invoice_payments, invoice_settings

## Warehouses
warehouses, warehouse_locations

## Notifications
notifications, notification_templates
