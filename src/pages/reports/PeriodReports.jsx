import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, TrendingUp, TrendingDown, ArrowLeft, Calendar,
  DollarSign, ShoppingCart, Users, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const PeriodReports = () => {
  const now = new Date();
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2, now.getFullYear() - 3];

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await invoke("report_period", { period, year });
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period, year]);

  const revenueData = data ? {
    labels: data.points.map(p => p.label),
    datasets: [{
      label: "Revenue (KSH)",
      data: data.points.map(p => p.revenue),
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

  const ordersData = data ? {
    labels: data.points.map(p => p.label),
    datasets: [{
      label: "Orders",
      data: data.points.map(p => p.orders),
      backgroundColor: "#f97316",
      borderColor: "#f97316",
      borderWidth: 1,
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

  const barOptions = lineOptions;

  const handlePrint = async () => {
    if (!data || data.points.length === 0) return;
    try {
      await exportPDF(
        `${period}-report-${year}.pdf`,
        `${period.charAt(0).toUpperCase() + period.slice(1)} Report — ${year}`,
        ["Period", "Orders", "Customers", "Revenue (KSH)"],
        data.points.map(p => [p.label, p.orders, p.customers, p.revenue.toFixed(2)]),
        {
          subtitle: `Revenue: KSH ${data.comparison.current_revenue.toFixed(2)} (${data.comparison.revenue_change_pct >= 0 ? "+" : ""}${data.comparison.revenue_change_pct.toFixed(1)}% vs last year)`,
          generated: new Date().toLocaleString(),
        }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (!data || data.points.length === 0) return;
    try {
      await exportCSV(
        `${period}-report-${year}.csv`,
        ["Period", "Orders", "Customers", "Revenue"],
        data.points.map(p => [p.label, p.orders, p.customers, p.revenue.toFixed(2)])
      );
      setSuccess("CSV exported.");
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export CSV.");
    }
  };

  const Change = ({ pct }) => {
    const positive = pct >= 0;
    return (
      <div className="flex items-center gap-1 mt-1">
        {positive ? <TrendingUp size={14} className="text-green-800" /> : <TrendingDown size={14} className="text-red-800" />}
        <span className={`text-xs font-bold ${positive ? "text-green-800" : "text-red-800"}`}>
          {positive ? "+" : ""}{pct.toFixed(1)}%
        </span>
        <span className="text-gray-500 text-xs font-medium">vs last year</span>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Period Reports</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Weekly, monthly, and yearly performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={!data || data.points.length === 0}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print PDF
          </button>
          <button onClick={handleExport} disabled={!data || data.points.length === 0}
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
            {["weekly", "monthly", "yearly"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-bold capitalize border-2 transition-colors ${
                  period === p ? "bg-blue-950 text-white border-blue-950"
                  : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={load}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 border-2 border-blue-950">
            Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin inline text-blue-950" />
        </div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-950">KSH {data.comparison.current_revenue.toFixed(0)}</p>
                  <Change pct={data.comparison.revenue_change_pct} />
                </div>
                <div className="bg-blue-950 p-3 border-2 border-white/20">
                  <DollarSign size={20} color="white" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-950">{data.comparison.current_orders}</p>
                  <Change pct={data.comparison.orders_change_pct} />
                </div>
                <div className="bg-green-800 p-3 border-2 border-white/20">
                  <ShoppingCart size={20} color="white" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Customers</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-950">{data.comparison.current_customers}</p>
                  <Change pct={data.comparison.customers_change_pct} />
                </div>
                <div className="bg-orange-600 p-3 border-2 border-white/20">
                  <Users size={20} color="white" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Order</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-950">
                    KSH {data.comparison.current_orders > 0
                      ? (data.comparison.current_revenue / data.comparison.current_orders).toFixed(0)
                      : "0"}
                  </p>
                </div>
                <div className="bg-blue-950 p-3 border-2 border-white/20">
                  <TrendingUp size={20} color="white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue Trend</h2>
              <div className="h-56">
                {data.points.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No data for this period.</p>
                ) : (
                  <Line data={revenueData} options={lineOptions} />
                )}
              </div>
            </div>
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Orders Trend</h2>
              <div className="h-56">
                {data.points.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No data for this period.</p>
                ) : (
                  <Bar data={ordersData} options={barOptions} />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PeriodReports;
