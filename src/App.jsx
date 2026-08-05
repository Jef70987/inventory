import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./layout/sidebar/Sidebar";

// Import all pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/inventory/Products";
import AddProduct from "./pages/inventory/AddProduct";
import BulkImport from "./pages/inventory/BulkImport";
import StockAdjustment from "./pages/inventory/StockAdjustment";
import LowStock from "./pages/inventory/LowStock";
import OutOfStock from "./pages/inventory/OutOfStock";
import Warehouses from "./pages/warehouses/Warehouses";
import AddWarehouse from "./pages/warehouses/AddWarehouse";
import StockTransfers from "./pages/warehouses/StockTransfers";
import PurchaseOrders from "./pages/purchases/PurchaseOrders";
import CreatePurchaseOrder from "./pages/purchases/CreatePurchaseOrder";
import ReceiveStock from "./pages/purchases/ReceiveStock";
import Suppliers from "./pages/purchases/Suppliers";
import POS from "./pages/sales/POS";
import AllSales from "./pages/sales/AllSales";
import SalesReturns from "./pages/sales/SalesReturns";
import AllInvoices from "./pages/invoices/AllInvoices";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import InvoiceSettings from "./pages/invoices/InvoiceSettings";
import AllCustomers from "./pages/customers/AllCustomers";
import AddCustomer from "./pages/customers/AddCustomer";
import PurchaseHistory from "./pages/customers/PurchaseHistory";
import SalesReports from "./pages/reports/SalesReports";
import DailySales from "./pages/reports/DailySales";
import PeriodReports from "./pages/reports/PeriodReports";
import TopProducts from "./pages/reports/TopProducts";
import RevenueTracking from "./pages/reports/RevenueTracking";
import ProfitMargin from "./pages/reports/ProfitMargin";
import SupplierPerformance from "./pages/reports/SupplierPerformance";
// import LowStockAlerts from "./pages/notifications/LowStockAlerts";
// import ReorderSuggestions from "./pages/notifications/ReorderSuggestions";
// import ExpiryAlerts from "./pages/notifications/ExpiryAlerts";
// import DailySummary from "./pages/notifications/DailySummary";
// import SystemEvents from "./pages/notifications/SystemEvents";
// import AllUsers from "./pages/users/AllUsers";
// import AddUser from "./pages/users/AddUser";
// import RolesPermissions from "./pages/users/RolesPermissions";
// import AuditTrail from "./pages/users/AuditTrail";
// import StoreConfig from "./pages/system/StoreConfig";
// import Backup from "./pages/system/Backup";
// import Restore from "./pages/system/Restore";
// import APISettings from "./pages/system/APISettings";
// import ExportData from "./pages/system/ExportData";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <div style={{ flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          padding: "0px",
          backgroundColor: "#f8fafc",
          minHeight: "100vh"
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory/products" element={<Products />} />
            <Route path="/inventory/add-product" element={<AddProduct />} />
            <Route path="/inventory/bulk-import" element={<BulkImport />} />
            <Route path="/inventory/stock-adjustment" element={<StockAdjustment />} />
            <Route path="/inventory/low-stock" element={<LowStock />} />
            <Route path="/inventory/out-of-stock" element={<OutOfStock />} />
            
            {/* Warehouse Routes */}
            <Route path="/warehouses/all" element={<Warehouses />} />
            <Route path="/warehouses/add" element={<AddWarehouse />} />
            <Route path="/warehouses/transfers" element={<StockTransfers />} />
            
            {/* Purchase Routes */}
            <Route path="/purchases/orders" element={<PurchaseOrders />} />
            <Route path="/purchases/create" element={<CreatePurchaseOrder />} />
            <Route path="/purchases/receive" element={<ReceiveStock />} />
            <Route path="/purchases/suppliers" element={<Suppliers />} />
            
            {/* Sales Routes */}
            <Route path="/sales/pos" element={<POS />} />
            <Route path="/sales/all" element={<AllSales />} />
            <Route path="/sales/returns" element={<SalesReturns />} />
            
            {/* Invoice Routes */}
            <Route path="/invoices/all" element={<AllInvoices />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/settings" element={<InvoiceSettings />} />
            
            {/* Customer Routes */}
            <Route path="/customers/all" element={<AllCustomers />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/customers/purchase-history" element={<PurchaseHistory />} />
            
            {/* Report Routes */}
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/daily" element={<DailySales />} />
            <Route path="/reports/period" element={<PeriodReports />} />
            <Route path="/reports/top-products" element={<TopProducts />} />
            <Route path="/reports/revenue" element={<RevenueTracking />} />
            <Route path="/reports/profit-margin" element={<ProfitMargin />} />
            <Route path="/reports/supplier-performance" element={<SupplierPerformance />} />
            
            {/* Notification Routes */}
            {/* <Route path="/notifications/low-stock" element={<LowStockAlerts />} />
            <Route path="/notifications/reorder" element={<ReorderSuggestions />} />
            <Route path="/notifications/expiry" element={<ExpiryAlerts />} />
            <Route path="/notifications/daily-summary" element={<DailySummary />} />
            <Route path="/notifications/system-events" element={<SystemEvents />} /> */}
            
            {/* User Routes */}
            {/* <Route path="/users/all" element={<AllUsers />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/users/roles" element={<RolesPermissions />} />
            <Route path="/users/audit" element={<AuditTrail />} /> */}
            
            {/* System Routes */}
            {/* <Route path="/system/store-config" element={<StoreConfig />} />
            <Route path="/system/backup" element={<Backup />} />
            <Route path="/system/restore" element={<Restore />} />
            <Route path="/system/api" element={<APISettings />} />
            <Route path="/system/export" element={<ExportData />} /> */}
            
            {/* Catch all */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;