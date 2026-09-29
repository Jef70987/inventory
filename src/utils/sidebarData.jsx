export const sidebarData = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    link: "/dashboard"
  },
    {
    title: "Sales",
    icon: "ShoppingCart",
    link: "/sales",
    subItems: [
      { title: "Point of Sale (POS)", link: "/sales/pos" },
      { title: "All Sales", link: "/sales/all" },
      { title: "Sales Returns", link: "/sales/returns" }
    ]
  },
  {
    title: "Customers",
    icon: "Users",
    link: "/customers",
    subItems: [
      { title: "All Customers", link: "/customers/all" },
      { title: "Add Customer", link: "/customers/add" },
      { title: "Purchase History", link: "/customers/purchase-history" }
    ]
  },
  {
    title: "Inventory",
    icon: "Package",
    link: "/inventory",
    subItems: [
      { title: "All Products", link: "/inventory/products" },
      { title: "Add Product", link: "/inventory/add-product" },
      { title: "Bulk Import", link: "/inventory/bulk-import" },
      { title: "Stock Adjustment", link: "/inventory/stock-adjustment" },
      { title: "Low Stock", link: "/inventory/low-stock" },
      { title: "Out of Stock", link: "/inventory/out-of-stock" }
    ]
  },
  {
    title: "Warehouses",
    icon: "Warehouse",
    link: "/warehouses",
    subItems: [
      { title: "All Warehouses", link: "/warehouses/all" },
      { title: "Add Warehouse", link: "/warehouses/add" },
      { title: "Stock Transfers", link: "/warehouses/transfers" }
    ]
  },
  {
    title: "Purchases",
    icon: "ShoppingBag",
    link: "/purchases",
    subItems: [
      { title: "Purchase Orders", link: "/purchases/orders" },
      { title: "Create Purchase Order", link: "/purchases/create" },
      { title: "Receive Stock", link: "/purchases/receive" },
      { title: "Suppliers", link: "/purchases/suppliers" }
    ]
  },

  {
    title: "Invoices",
    icon: "FileText",
    link: "/invoices",
    subItems: [
      { title: "All Invoices", link: "/invoices/all" },
      { title: "Create Invoice", link: "/invoices/create" },
      { title: "Invoice Settings", link: "/invoices/settings" }
    ]
  },
  
  {
    title: "Reports",
    icon: "BarChart3",
    link: "/reports",
    subItems: [
      { title: "Sales Reports", link: "/reports/sales" },
      { title: "Daily Sales", link: "/reports/daily" },
      { title: "Weekly/Monthly/Yearly", link: "/reports/period" },
      { title: "Top Selling Products", link: "/reports/top-products" },
      { title: "Revenue Tracking", link: "/reports/revenue" },
      { title: "Profit Margin", link: "/reports/profit-margin" },
      { title: "Supplier Performance", link: "/reports/supplier-performance" }
    ]
  },
  {
    title: "Notifications",
    icon: "Bell",
    link: "/notifications",
    subItems: [
      { title: "Low Stock Alerts", link: "/notifications/low-stock" },
      { title: "Reorder Suggestions", link: "/notifications/reorder" },
      { title: "Expiry Alerts", link: "/notifications/expiry" },
      { title: "Daily Summary", link: "/notifications/daily-summary" },
      { title: "System Events", link: "/notifications/system-events" }
    ]
  },
  {
    title: "Users",
    icon: "UserCog",
    link: "/users",
    subItems: [
      { title: "All Users", link: "/users/all" },
      { title: "Add User", link: "/users/add" },
      { title: "Roles & Permissions", link: "/users/permissions" },
      { title: "Audit Trail", link: "/users/audit-trail" }
    ]
  },
  {
    title: "System",
    icon: "Settings",
    link: "/system",
    subItems: [
      { title: "Store Configuration", link: "/system/store-config" },
      { title: "Backup", link: "/system/backup" },
      { title: "Restore", link: "/system/restore" },
      { title: "API Settings", link: "/system/api" },
      { title: "Export Data", link: "/system/export" }
    ]
  },
  {
    title: "Logout",
    icon: "LogOut",
    link: "/logout"
  }
];