import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Download, Printer, TrendingUp, TrendingDown, ArrowLeft, Calendar,
  Loader2, AlertCircle, CheckCircle, Percent, DollarSign
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { exportCSV, exportPDF } from "../../utils/exporters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfitMargin = () => {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [period, setPeriod] = useState("month");
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
      const d = await invoke("report_profit_margin", { fromDate, toDate });
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = data ? {
    labels: data.rows.slice(0, 8).map(p => p.name),
    datasets: [{
      label: "Margin %",
      data: data.rows.slice(0, 8).map(p => p.margin_pct),
      backgroundColor: "#1e3a5f",
      borderColor: "#1e3a5f",
      borderWidth: 1,
    }],
  } : null;

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

  const marginBg = (m) => {
    if (m >= 50) return "bg-green-800 text-white";
    if (m >= 30) return "bg-orange-600 text-white";
    return "bg-red-800 text-white";
  };

  const handlePrint = async () => {
    if (!data || data.rows.length === 0) return;
    try {
      const rows = data.rows.map(p => [
        p.name, p.sku,
        `KSH ${p.cost_price.toFixed(2)}`,
        `KSH ${p.sell_price.toFixed(2)}`,
        p.quantity,
        `KSH ${p.revenue.toFixed(2)}`,
        `KSH ${p.profit.toFixed(2)}`,
        `${p.margin_pct.toFixed(1)}%`,
      ]);
      await exportPDF(
        `profit-margin-${fromDate}-to-${toDate}.pdf`,
        `Profit Margin — ${fromDate} to ${toDate}`,
        ["Product", "SKU", "Cost", "Price", "Qty", "Revenue", "Profit", "Margin"],
        rows,
        {
          subtitle: `Total Revenue: KSH ${data.total_revenue.toFixed(2)}  |  Total Profit: KSH ${data.total_profit.toFixed(2)}  |  Avg Margin: ${data.avg_margin_pct.toFixed(1)}%`,
          generated: new Date().toLocaleString(),
        }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (!data || data.rows.length === 0) return;
    try {
      await exportCSV(
        `profit-margin-${fromDate}-to-${toDate}.csv`,
        ["Product", "SKU", "Cost Price", "Sell Price", "Qty Sold", "Revenue", "Total Cost", "Profit", "Margin %"],
        data.rows.map(p => [
          p.name, p.sku,
          p.cost_price.toFixed(2), p.sell_price.toFixed(2),
          p.quantity, p.revenue.toFixed(2),
          p.total_cost.toFixed(2), p.profit.toFixed(2),
          p.margin_pct.toFixed(2),
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Profit Margin Analysis</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Analyze profit margins across products</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={!data || data.rows.length === 0}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print PDF
          </button>
          <button onClick={handleExport} disabled={!data || data.rows.length === 0}
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
            <Stat label="Avg Margin" value={`${data.avg_margin_pct.toFixed(1)}%`} icon={Percent} color="border-blue-950" bg="bg-blue-950" />
            <Stat label="Highest Margin" value={data.highest ? `${data.highest.margin_pct.toFixed(1)}%` : "—"}
              sub={data.highest?.name} icon={TrendingUp} color="border-green-800" bg="bg-green-800" />
            <Stat label="Lowest Margin" value={data.lowest ? `${data.lowest.margin_pct.toFixed(1)}%` : "—"}
              sub={data.lowest?.name} icon={TrendingDown} color="border-orange-600" bg="bg-orange-600" />
            <Stat label="Total Profit" value={`KSH ${data.total_profit.toFixed(0)}`} icon={DollarSign} color="border-blue-950" bg="bg-blue-950" />
          </div>

          <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Product Margins</h2>
            <div className="h-64">
              {data.rows.length === 0 ? (
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
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Product</th>
                  <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">SKU</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Cost</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Price</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Qty</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Revenue</th>
                  <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Profit</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 && (
                  <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">No data.</td></tr>
                )}
                {data.rows.map(p => (
                  <tr key={p.product_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{p.sku}</td>
                    <td className="py-3 px-4 text-right text-gray-700">KSH {p.cost_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.sell_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-950">{p.quantity}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-800">KSH {p.profit.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold ${marginBg(p.margin_pct)}`}>
                        {p.margin_pct.toFixed(1)}%
                      </span>
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

const Stat = ({ label, value, sub, icon: Icon, color, bg }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm flex items-center justify-between`}>
    <div className="min-w-0">
      <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-blue-950 truncate">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 truncate">{sub}</p>}
    </div>
    {Icon && (
      <div className={`${bg} p-2 border-2 border-white/20 flex-shrink-0`}>
        <Icon size={18} color="white" />
      </div>
    )}
  </div>
);

export default ProfitMargin;
