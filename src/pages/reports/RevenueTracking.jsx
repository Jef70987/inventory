import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, Calendar, ArrowLeft, Loader2, AlertCircle,
  CheckCircle, DollarSign, Wallet, PiggyBank, CreditCard
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

const RevenueTracking = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState("month");
  const [fromDate, setFromDate] = useState(today.slice(0, 8) + "01");
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState(null);
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
      const d = await invoke("report_revenue_tracking", { fromDate, toDate });
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const lineData = data ? {
    labels: data.monthly.map(m => m.month),
    datasets: [
      {
        label: "Revenue",
        data: data.monthly.map(m => m.revenue),
        borderColor: "#1e3a5f",
        backgroundColor: "rgba(30, 58, 95, 0.1)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#1e3a5f",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Expenses",
        data: data.monthly.map(m => m.expenses),
        borderColor: "#991b1b",
        backgroundColor: "rgba(153, 27, 27, 0.1)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#991b1b",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  } : null;

  const profitData = data ? {
    labels: data.monthly.map(m => m.month),
    datasets: [{
      label: "Profit",
      data: data.monthly.map(m => m.profit),
      backgroundColor: "#166534",
      borderColor: "#166534",
      borderWidth: 1,
    }],
  } : null;

  const sourceData = data ? {
    labels: data.revenue_sources.map(s => s.method),
    datasets: [{
      data: data.revenue_sources.map(s => s.amount),
      backgroundColor: ["#1e3a5f", "#f97316", "#166534", "#4c1d95", "#991b1b"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  } : null;

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 11 } } } },
    scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } }, x: { grid: { display: false } } },
  };
  const barOptions = lineOptions;
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 11 } } } },
    cutout: "60%",
  };

  const handlePrint = async () => {
    if (!data) return;
    try {
      await exportPDF(
        `revenue-${fromDate}-to-${toDate}.pdf`,
        `Revenue Tracking — ${fromDate} to ${toDate}`,
        ["Month", "Revenue", "Expenses", "Profit"],
        data.monthly.map(m => [m.month, m.revenue.toFixed(2), m.expenses.toFixed(2), m.profit.toFixed(2)]),
        {
          subtitle: `Revenue: KSH ${data.total_revenue.toFixed(2)}  |  COGS: KSH ${data.total_cogs.toFixed(2)}  |  OpEx: KSH ${data.total_operating_expenses.toFixed(2)}  |  Net: KSH ${data.net_profit.toFixed(2)} (${data.profit_margin_pct.toFixed(1)}%)`,
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
        `revenue-${fromDate}-to-${toDate}.csv`,
        ["Month", "Revenue", "Expenses", "Profit"],
        data.monthly.map(m => [m.month, m.revenue.toFixed(2), m.expenses.toFixed(2), m.profit.toFixed(2)])
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Revenue Tracking</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Revenue, expenses, and profitability</p>
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
            Update
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
            <Stat label="COGS" value={`KSH ${data.total_cogs.toFixed(0)}`} icon={CreditCard} color="border-orange-600" bg="bg-orange-600" />
            <Stat label="Net Profit" value={`KSH ${data.net_profit.toFixed(0)}`} icon={Wallet} color="border-green-800" bg="bg-green-800" />
            <Stat label="Profit Margin" value={`${data.profit_margin_pct.toFixed(1)}%`} icon={PiggyBank} color="border-blue-950" bg="bg-blue-950" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue vs Expenses</h2>
              <div className="h-64">
                {data.monthly.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No data.</p>
                ) : <Line data={lineData} options={lineOptions} />}
              </div>
            </div>
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Monthly Profit</h2>
              <div className="h-64">
                {data.monthly.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-16">No data.</p>
                ) : <Bar data={profitData} options={barOptions} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue Sources</h2>
              <div className="h-52">
                {data.revenue_sources.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-12">No payments.</p>
                ) : <Doughnut data={sourceData} options={doughnutOptions} />}
              </div>
            </div>
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <Row label="Total Revenue" value={`KSH ${data.total_revenue.toFixed(2)}`} />
                <Row label="Cost of Goods Sold" value={`-KSH ${data.total_cogs.toFixed(2)}`} danger />
                <Row label="Operating Expenses" value={`-KSH ${data.total_operating_expenses.toFixed(2)}`} danger />
                <Row label="Net Profit" value={`KSH ${data.net_profit.toFixed(2)}`} big />
                <Row label="Profit Margin" value={`${data.profit_margin_pct.toFixed(1)}%`} />
              </div>
            </div>
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

const Row = ({ label, value, danger, big }) => (
  <div className={`flex justify-between items-center border-b border-gray-100 pb-2 ${big ? "border-b-2 border-blue-950/10 pt-2" : ""}`}>
    <span className={`${big ? "font-bold text-blue-950" : "text-gray-600 font-medium"}`}>{label}</span>
    <span className={`font-bold ${big ? "text-green-800 text-lg" : danger ? "text-red-800" : "text-blue-950"}`}>{value}</span>
  </div>
);

export default RevenueTracking;
