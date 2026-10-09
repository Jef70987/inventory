import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, TrendingUp, TrendingDown, ArrowLeft, Calendar,
  Loader2, AlertCircle, CheckCircle, Package
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopProducts = () => {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [period, setPeriod] = useState("month");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyPeriod = (p) => {
    setPeriod(p);
    const now = new Date();
    const t = now.toISOString().slice(0, 10);
    let start = new Date(now);
    if (p === "week") start.setDate(now.getDate() - 6);
    else if (p === "month") start.setDate(1);
    else if (p === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else if (p === "year") start = new Date(now.getFullYear(), 0, 1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(t);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await invoke("report_top_products", {
        fromDate, toDate, limit: 50,
      });
      setProducts(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = {
    labels: products.slice(0, 6).map(p => p.name),
    datasets: [{
      label: "Revenue (KSH)",
      data: products.slice(0, 6).map(p => p.revenue),
      backgroundColor: ["#1e3a5f", "#f97316", "#166534", "#991b1b", "#4c1d95", "#1e293b"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 11 } } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const getBadge = (p, idx) => {
    if (idx === 0) return { label: "Best Seller", cls: "bg-green-800 text-white" };
    if (p.margin_pct >= 50) return { label: "High Margin", cls: "bg-blue-950 text-white" };
    if (p.quantity >= 100) return { label: "High Volume", cls: "bg-purple-800 text-white" };
    if (idx < 5) return { label: "Popular", cls: "bg-orange-600 text-white" };
    return { label: "Niche", cls: "bg-gray-700 text-white" };
  };

  const handlePrint = async () => {
    if (products.length === 0) return;
    try {
      const rows = products.map(p => [
        p.name, p.sku, p.category_name || "—",
        p.quantity, `KSH ${p.revenue.toFixed(2)}`, `${p.margin_pct.toFixed(1)}%`,
      ]);
      await exportPDF(
        `top-products-${fromDate}-to-${toDate}.pdf`,
        `Top Products — ${fromDate} to ${toDate}`,
        ["Product", "SKU", "Category", "Qty Sold", "Revenue", "Margin"],
        rows,
        { generated: new Date().toLocaleString() }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (products.length === 0) return;
    try {
      await exportCSV(
        `top-products-${fromDate}-to-${toDate}.csv`,
        ["Rank", "Product", "SKU", "Category", "Qty Sold", "Revenue", "Cost", "Margin %"],
        products.map(p => [
          p.rank, p.name, p.sku, p.category_name || "", p.quantity,
          p.revenue.toFixed(2), p.cost.toFixed(2), p.margin_pct.toFixed(2),
        ])
      );
      setSuccess("CSV exported.");
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export CSV.");
    }
  };

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + p.margin_pct, 0) / products.length
    : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Top Selling Products</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Best performing products by revenue and volume</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={products.length === 0}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print PDF
          </button>
          <button onClick={handleExport} disabled={products.length === 0}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 border-2 border-blue-950 text-xs sm:text-sm disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/reports/sales">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          </Link>
        </div>
      </div>

      {(error || success) && (
        <div className={`mb-4 p-3 border-l-4 flex items-start gap-2 ${
          error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-800"
        }`}>
          {error ? <AlertCircle size={16} className="text-red-600 mt-0.5" /> : <CheckCircle size={16} className="text-green-800 mt-0.5" />}
          <p className={`text-xs font-bold ${error ? "text-red-800" : "text-green-800"}`}>{error || success}</p>
        </div>
      )}

      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar size={18} className="text-blue-950" />
          <span className="font-bold text-blue-950 text-sm">Period:</span>
          <div className="flex gap-1">
            {["week", "month", "quarter", "year"].map(p => (
              <button key={p} onClick={() => applyPeriod(p)}
                className={`px-3 py-1 text-xs font-bold capitalize border-2 transition-colors ${
                  period === p ? "bg-blue-950 text-white border-blue-950"
                  : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
          <span className="text-gray-500 font-medium text-sm">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
          <button onClick={load}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 border-2 border-blue-950">
            Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Products Sold" value={products.length} color="border-blue-950" />
        <Stat label="Total Units" value={totalUnits} color="border-green-800" />
        <Stat label="Total Revenue" value={`KSH ${totalRevenue.toFixed(0)}`} color="border-orange-600" />
        <Stat label="Avg Margin" value={`${avgMargin.toFixed(1)}%`} color="border-blue-950" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin inline text-blue-950" />
        </div>
      ) : (
        <>
          <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue by Product</h2>
            <div className="h-64">
              {products.length === 0 ? (
                <p className="text-center text-gray-500 font-medium text-xs py-16">No sales in this period.</p>
              ) : (
                <Bar data={chartData} options={barOptions} />
              )}
            </div>
          </div>

          <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                  <th className="text-center py-3 px-3 font-bold text-blue-950 text-xs uppercase">#</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Product</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">SKU</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Category</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Revenue</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Units</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Margin</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Tag</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">No products sold in this period.</td></tr>
                )}
                {products.map((p, idx) => {
                  const badge = getBadge(p, idx);
                  return (
                    <tr key={p.product_id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 text-center font-bold text-gray-500">{p.rank}</td>
                      <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{p.sku}</td>
                      <td className="py-3 px-4 text-gray-700">{p.category_name || "—"}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-950">{p.quantity}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${p.margin_pct >= 50 ? "text-green-800" : p.margin_pct >= 30 ? "text-orange-600" : "text-red-800"}`}>
                          {p.margin_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-blue-950">{value}</p>
  </div>
);

export default TopProducts;
