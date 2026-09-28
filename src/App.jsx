import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./layout/sidebar/Sidebar";
import Header from "./layout/header/Header";

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

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Inventory */}
              <Route path="/inventory/products" element={<Products />} />
              <Route path="/inventory/add-product" element={<AddProduct />} />
              <Route path="/inventory/bulk-import" element={<BulkImport />} />
              <Route path="/inventory/stock-adjustment" element={<StockAdjustment />} />
              <Route path="/inventory/low-stock" element={<LowStock />} />
              <Route path="/inventory/out-of-stock" element={<OutOfStock />} />

              {/* Warehouses */}
              <Route path="/warehouses/all" element={<Warehouses />} />
              <Route path="/warehouses/add" element={<AddWarehouse />} />
              <Route path="/warehouses/transfers" element={<StockTransfers />} />

              {/* Purchases */}
              <Route path="/purchases/orders" element={<PurchaseOrders />} />
              <Route path="/purchases/create" element={<CreatePurchaseOrder />} />
              <Route path="/purchases/receive" element={<ReceiveStock />} />
              <Route path="/purchases/suppliers" element={<Suppliers />} />

              {/* Sales */}
              <Route path="/sales/pos" element={<POS />} />
              <Route path="/sales/all" element={<AllSales />} />
              <Route path="/sales/returns" element={<SalesReturns />} />

              {/* Invoices */}
              <Route path="/invoices/all" element={<AllInvoices />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/invoices/settings" element={<InvoiceSettings />} />

              {/* Customers */}
              <Route path="/customers/all" element={<AllCustomers />} />
              <Route path="/customers/add" element={<AddCustomer />} />
              <Route path="/customers/purchase-history" element={<PurchaseHistory />} />

              {/* Reports */}
              <Route path="/reports/sales" element={<SalesReports />} />
              <Route path="/reports/daily" element={<DailySales />} />
              <Route path="/reports/period" element={<PeriodReports />} />
              <Route path="/reports/top-products" element={<TopProducts />} />
              <Route path="/reports/revenue" element={<RevenueTracking />} />
              <Route path="/reports/profit-margin" element={<ProfitMargin />} />
              <Route path="/reports/supplier-performance" element={<SupplierPerformance />} />

              {/* Catch all */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
