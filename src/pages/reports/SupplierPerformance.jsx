import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, ArrowLeft, Calendar, Star, Truck, Package,
  DollarSign, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SupplierPerformance = () => {
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
    if (p === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else if (p === "year") start = new Date(now.getFullYear(), 0, 1);
    else start.setDate(1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(t);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await invoke("report_supplier_performance", { fromDate, toDate });
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = data ? {
    labels: data.suppliers.map(s => s.name),
    datasets: [{
      label: "On-Time Delivery %",
      data: data.suppliers.map(s => s.on_time_pct),
      backgroundColor: ["#166534", "#1e3a5f", "#f97316", "#991b1b", "#4c1d95"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  } : null;

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 11 } } } },
    scales: { y: { beginAtZero: true, max: 100, grid: { color: "rgba(0,0,0,0.05)" } }, x: { grid: { display: false } } },
  };

  const getStatusColor = (s) => ({
    Excellent: "bg-green-800 text-white",
    Good: "bg-blue-950 text-white",
    Average: "bg-orange-600 text-white",
    Poor: "bg-red-800 text-white",
  }[s] || "bg-gray-700 text-white");

  const stars = (r) => {
    const out = [];
    const full = Math.floor(r);
    for (let i = 0; i < full; i++) out.push(<Star key={i} size={12} className="text-orange-600 fill-orange-600" />);
    for (let i = full; i < 5; i++) out.push(<Star key={i} size={12} className="text-gray-300" />);
    return out;
  };

  const handlePrint = async () => {
    if (!data || data.suppliers.length === 0) return;
    try {
      await exportPDF(
        `supplier-performance-${fromDate}-to-${toDate}.pdf`,
        `Supplier Performance — ${fromDate} to ${toDate}`,
        ["Supplier", "Orders", "Received", "On-Time %", "Spend (KSH)", "Rating", "Status"],
        data.suppliers.map(s => [
          s.name, s.total_orders, s.received_orders,
          s.on_time_pct.toFixed(1), s.total_spend.toFixed(2),
          s.rating.toFixed(1), s.status,
        ]),
        { generated: new Date().toLocaleString() }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (!data || data.suppliers.length === 0) return;
    try {
      await exportCSV(
        `supplier-performance-${fromDate}-to-${toDate}.csv`,
        ["Supplier", "Contact", "Phone", "Total Orders", "Received", "Pending", "Cancelled", "On-Time %", "Total Spend", "Avg Order", "Rating", "Status"],
        data.suppliers.map(s => [
          s.name, s.contact_name || "", s.phone || "",
          s.total_orders, s.received_orders, s.pending_orders, s.cancelled_orders,
          s.on_time_pct.toFixed(2), s.total_spend.toFixed(2),
          s.avg_order_value.toFixed(2), s.rating.toFixed(1), s.status,
        ])
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Supplier Performance</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Reliability, quality, and spend per supplier</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={!data || data.suppliers.length === 0}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print PDF
          </button>
          <button onClick={handleExport} disabled={!data || data.suppliers.length === 0}
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
            {["month", "quarter", "year"].map(p => (
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
            <Stat label="Total Suppliers" value={data.total_suppliers} icon={Truck} color="border-blue-950" bg="bg-blue-950" />
            <Stat label="Avg Rating" value={data.avg_rating.toFixed(1)} icon={Star} color="border-green-800" bg="bg-green-800" />
            <Stat label="Total POs" value={data.suppliers.reduce((s, x) => s + x.total_orders, 0)} icon={Package} color="border-orange-600" bg="bg-orange-600" />
            <Stat label="Total Spend" value={`KSH ${data.total_spend.toFixed(0)}`} icon={DollarSign} color="border-blue-950" bg="bg-blue-950" />
          </div>

          <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">On-Time Delivery</h2>
            <div className="h-64">
              {data.suppliers.length === 0 ? (
                <p className="text-center text-gray-500 font-medium text-xs py-16">No suppliers.</p>
              ) : <Bar data={chartData} options={barOptions} />}
            </div>
          </div>

          <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Supplier</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Orders</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Received</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">On-Time %</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Spend</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Rating</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.suppliers.length === 0 && (
                  <tr><td colSpan="7" className="py-8 text-center text-gray-500 font-medium">No suppliers.</td></tr>
                )}
                {data.suppliers.map(s => (
                  <tr key={s.supplier_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-blue-950">{s.name}</p>
                      {s.contact_name && <p className="text-[10px] text-gray-500">{s.contact_name}</p>}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-950">{s.total_orders}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-green-800">{s.received_orders}</span>
                      <span className="text-gray-500 text-xs"> ({s.on_time_pct.toFixed(0)}%)</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-950">{s.on_time_pct.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {s.total_spend.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {stars(s.rating)}
                        <span className="text-xs font-bold text-gray-600 ml-1">{s.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(s.status)}`}>{s.status}</span>
                    </td>
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

export default SupplierPerformance;
