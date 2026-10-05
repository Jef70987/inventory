import { useState, useEffect, useRef } from "react";
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./layout/sidebar/Sidebar";
import Header from "./layout/header/Header";

import Login from "./auth/Login";
import Forgot from "./auth/Forgot";
import Reset from "./auth/Reset";
import Logout from "./auth/Logout";
import Setup from "./auth/Setup";

import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/inventory/Products";
import AddProduct from "./pages/inventory/AddProduct";
import BulkImport from "./pages/inventory/BulkImport";
import StockAdjustment from "./pages/inventory/StockAdjustment";
import LowStock from "./pages/inventory/LowStock";
import OutOfStock from "./pages/inventory/OutOfStock";
import Lookups from "./pages/inventory/Lookups";
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
import AllUsers from "./pages/users/AllUsers";
import AddUser from "./pages/users/AddUser";
import Groups from "./pages/users/Groups";
import Permissions from "./pages/users/Permissions";
import AuditTrail from "./pages/users/AuditTrail";
import EditUser from "./pages/users/EditUser";

function BootGuard({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    (async () => {
      try {
        const setupDone = await invoke("check_setup_complete");
        if (!setupDone) {
          navigate("/auth/setup", { replace: true });
        } else {
          const session = localStorage.getItem("session_token");
          if (!session) {
            navigate("/auth/login", { replace: true });
          } else {
            try {
              await invoke("get_me", { sessionToken: session });
            } catch {
              localStorage.removeItem("session_token");
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");
              navigate("/auth/login", { replace: true });
            }
          }
        }
      } catch (e) {
        console.error("Boot check failed:", e);
        navigate("/auth/login", { replace: true });
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-orange-200 uppercase tracking-widest font-bold">Loading…</p>
        </div>
      </div>
    );
  }
  return children;
}

function AppShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname.startsWith("/auth");

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot" element={<Forgot />} />
        <Route path="/auth/reset" element={<Reset />} />
        <Route path="/auth/logout" element={<Logout />} />
        <Route path="/auth/setup" element={<Setup />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory/products" element={<Products />} />
            <Route path="/inventory/add-product" element={<AddProduct />} />
            <Route path="/inventory/edit-product/:id" element={<AddProduct />} />
            <Route path="/inventory/bulk-import" element={<BulkImport />} />
            <Route path="/inventory/stock-adjustment" element={<StockAdjustment />} />
            <Route path="/inventory/low-stock" element={<LowStock />} />
            <Route path="/inventory/out-of-stock" element={<OutOfStock />} />
            <Route path="/inventory/lookups" element={<Lookups />} />
            <Route path="/warehouses/all" element={<Warehouses />} />
            <Route path="/warehouses/add" element={<Warehouses />} />
            <Route path="/warehouses/transfers" element={<StockTransfers />} />
            <Route path="/purchases/orders" element={<PurchaseOrders />} />
            <Route path="/purchases/create" element={<CreatePurchaseOrder />} />
            <Route path="/purchases/receive" element={<ReceiveStock />} />
            <Route path="/purchases/suppliers" element={<Suppliers />} />
            <Route path="/sales/pos" element={<POS />} />
            <Route path="/sales/all" element={<AllSales />} />
            <Route path="/sales/returns" element={<SalesReturns />} />
            <Route path="/invoices/all" element={<AllInvoices />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/settings" element={<InvoiceSettings />} />
            <Route path="/customers/all" element={<AllCustomers />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/customers/:id/purchases" element={<PurchaseHistory />} />
            <Route path="/reports/sales" element={<SalesReports />} />
            <Route path="/reports/daily" element={<DailySales />} />
            <Route path="/reports/period" element={<PeriodReports />} />
            <Route path="/reports/top-products" element={<TopProducts />} />
            <Route path="/reports/revenue" element={<RevenueTracking />} />
            <Route path="/reports/profit-margin" element={<ProfitMargin />} />
            <Route path="/reports/supplier-performance" element={<SupplierPerformance />} />
            <Route path="/users/all" element={<AllUsers />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/users/groups" element={<Groups />} />
            <Route path="/users/permissions" element={<Permissions />} />
            <Route path="/users/audit-trail" element={<AuditTrail />} />
            <Route path="/users/edit/:id" element={<EditUser />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <BootGuard>
        <AppShell />
      </BootGuard>
    </Router>
  );
}

export default App;
