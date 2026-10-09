import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, Calendar, DollarSign, ShoppingCart, TrendingUp,
  Users, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler, ArcElement
);

const SalesReports = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [dateRange, setDateRange] = useState("month");
  const [bucket, setBucket] = useState("day");
  const [fromDate, setFromDate] = useState(today.slice(0, 8) + "01");
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyRange = (r) => {
    setDateRange(r);
    const now = new Date();
    const t = now.toISOString().slice(0, 10);
    let start = new Date(now);
    if (r === "today") start = now;
    else if (r === "week") start.setDate(now.getDate() - 6);
    else if (r === "month") start.setDate(1);
    else if (r === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else if (r === "year") start = new Date(now.getFullYear(), 0, 1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(t);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await invoke("report_sales_summary", {
        fromDate, toDate, bucket,
      });
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const trendData = data ? {
    labels: data.trend.map(p => p.label),
    datasets: [{
      label: "Revenue (KSH)",
      data: data.trend.map(p => p.revenue),
      borderColor: "#1e3a5f",
      backgroundColor: "rgba(30, 58, 95, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#1e3a5f",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  } : null;

  const categoryData = data ? {
    labels: data.by_category.map(c => c.category_name),
    datasets: [{
      data: data.by_category.map(c => c.revenue),
      backgroundColor: ["#1e3a5f", "#f97316", "#166534", "#991b1b", "#4c1d95", "#1e293b"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  } : null;

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 11 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 10 } } } },
    cutout: "60%",
  };

  const handlePrint = async () => {
    if (!data) return;
    try {
      await exportPDF(
        `sales-report-${fromDate}-to-${toDate}.pdf`,
        `Sales Report — ${fromDate} to ${toDate}`,
        ["Category", "Units", "Revenue (KSH)"],
        data.by_category.map(c => [c.category_name, c.units, c.revenue.toFixed(2)]),
        {
          subtitle: `Revenue: KSH ${data.total_revenue.toFixed(2)}  |  Orders: ${data.total_orders}  |  Avg Order: KSH ${data.avg_order.toFixed(2)}  |  Customers: ${data.unique_customers}`,
          generated: new Date().toLocaleString(),
        }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (!data) return;
    try {
      await exportCSV(
        `sales-report-${fromDate}-to-${toDate}.csv`,
        ["Category", "Units Sold", "Revenue"],
        data.by_category.map(c => [c.category_name, c.units, c.revenue.toFixed(2)])
      );
      setSuccess("CSV exported.");
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export CSV.");
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Sales Reports</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Comprehensive sales analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={!data}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print PDF
          </button>
          <button onClick={handleExport} disabled={!data}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 border-2 border-blue-950 text-xs sm:text-sm disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
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
          <span className="font-bold text-blue-950 text-sm">Range:</span>
          <div className="flex gap-1">
            {["today", "week", "month", "quarter", "year"].map(r => (
              <button key={r} onClick={() => applyRange(r)}
                className={`px-3 py-1 text-xs font-bold capitalize border-2 transition-colors ${
                  dateRange === r ? "bg-blue-950 text-white border-blue-950"
                  : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
          <span className="text-gray-500 font-medium text-sm">to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
          <select value={bucket} onChange={(e) => setBucket(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
          </select>
          <button onClick={load}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 border-2 border-blue-950">
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin inline text-blue-950" />
        </div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Stat label="Total Revenue" value={`KSH ${data.total_revenue.toFixed(0)}`} icon={DollarSign} color="border-blue-950" bg="bg-blue-950" />
            <Stat label="Total Sales" value={data.total_orders} icon={ShoppingCart} color="border-green-800" bg="bg-green-800" />
            <Stat label="Avg Order" value={`KSH ${data.avg_order.toFixed(0)}`} icon={TrendingUp} color="border-orange-600" bg="bg-orange-600" />
            <Stat label="Customers" value={data.unique_customers} icon={Users} color="border-blue-950" bg="bg-blue-950" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Sales Trend</h2>
              <div className="h-64">
                {data.trend.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No sales in this range.</p>
                ) : (
                  <Line data={trendData} options={lineOptions} />
                )}
              </div>
            </div>
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Sales by Category</h2>
              <div className="h-64">
                {data.by_category.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No data.</p>
                ) : (
                  <Doughnut data={categoryData} options={doughnutOptions} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
            <div className="p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Category Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Category</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Units Sold</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.by_category.length === 0 && (
                  <tr><td colSpan="3" className="py-6 text-center text-gray-500 text-xs font-medium">No sales.</td></tr>
                )}
                {data.by_category.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-blue-950">{c.category_name}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-950">{c.units}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {c.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-blue-950">{value}</p>
    </div>
    <div className={`${bg} p-2 border-2 border-white/20`}>
      <Icon size={18} color="white" />
    </div>
  </div>
);

export default SalesReports;
