import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Calendar, Download, Printer, DollarSign, ShoppingCart, Users,
  TrendingUp, ArrowLeft, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
import { exportCSV, exportPDF } from "../../utils/exporters";

const DailySales = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await invoke("report_daily_sales", { date: selectedDate });
      setData(summary);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedDate]);

  const hourlyChartData = data ? {
    labels: data.hourly_sales.map(h => h.hour),
    datasets: [{
      label: "Sales",
      data: data.hourly_sales.map(h => h.sales),
      backgroundColor: "#1e3a5f",
      borderRadius: 0,
      borderColor: "#1e3a5f",
      borderWidth: 1,
    }],
  } : null;

  const paymentChartData = data ? {
    labels: data.payment_methods.map(p => p.method),
    datasets: [{
      data: data.payment_methods.map(p => p.amount),
      backgroundColor: ["#1e3a5f", "#f97316", "#166534", "#991b1b"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  } : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 10 } },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 10 } },
      },
    },
    cutout: "60%",
  };

  const handlePrint = async () => {
    if (!data) return;
    setError("");
    try {
      const rows = data.top_products.map(p => [p.name, p.sku, p.quantity, `KSH ${p.revenue.toFixed(2)}`]);
      const columns = ["Product", "SKU", "Qty Sold", "Revenue"];
      await exportPDF(
        `daily-sales-${data.date}.pdf`,
        `Daily Sales Report — ${data.date}`,
        columns,
        rows,
        {
          subtitle: `Total Sales: ${data.total_sales}  |  Revenue: KSH ${data.total_revenue.toFixed(2)}  |  Avg Order: KSH ${data.avg_order.toFixed(2)}  |  Customers: ${data.unique_customers}`,
          generated: new Date().toLocaleString(),
        }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const handleExport = async () => {
    if (!data) return;
    setError("");
    try {
      // Top products
      await exportCSV(
        `daily-sales-${data.date}.csv`,
        ["Product", "SKU", "Qty Sold", "Revenue"],
        data.top_products.map(p => [p.name, p.sku, p.quantity, p.revenue.toFixed(2)])
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Daily Sales Report</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Detailed sales summary for a specific day</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePrint} disabled={!data}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm disabled:opacity-50">
            <Printer size={16} /> Print (PDF)
          </button>
          <button onClick={handleExport} disabled={!data}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/reports/sales">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Select Date:</span>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
          <button onClick={load}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            Refresh
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
            <Stat label="Total Sales" value={data.total_sales} icon={ShoppingCart} color="border-blue-950" bg="bg-blue-950" />
            <Stat label="Revenue" value={`KSH ${data.total_revenue.toFixed(2)}`} icon={DollarSign} color="border-green-800" bg="bg-green-800" />
            <Stat label="Avg Order" value={`KSH ${data.avg_order.toFixed(2)}`} icon={TrendingUp} color="border-orange-600" bg="bg-orange-600" />
            <Stat label="Customers" value={data.unique_customers} icon={Users} color="border-blue-950" bg="bg-blue-950" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Hourly Sales</h2>
              <div className="h-52">
                {data.hourly_sales.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-12">No sales this day.</p>
                ) : (
                  <Bar data={hourlyChartData} options={barOptions} />
                )}
              </div>
            </div>
            <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Payment Methods</h2>
              <div className="h-52">
                {data.payment_methods.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium text-xs py-12">No payments this day.</p>
                ) : (
                  <Doughnut data={paymentChartData} options={doughnutOptions} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-950/10 shadow-sm mb-6">
            <div className="p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Top Selling Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Product</th>
                    <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Quantity Sold</th>
                    <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.length === 0 && (
                    <tr><td colSpan="3" className="py-6 text-center text-gray-500 text-xs font-medium">No products sold.</td></tr>
                  )}
                  {data.top_products.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-950">{p.quantity}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-950/10 shadow-sm">
            <div className="p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Payment Method Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
              {data.payment_methods.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 text-xs font-medium">No payments.</p>
              ) : data.payment_methods.map((m, i) => (
                <div key={i} className="bg-gray-50 p-4 border-l-4 border-blue-950">
                  <p className="text-xs text-gray-500 font-medium capitalize">{m.method}</p>
                  <p className="text-xl font-bold text-blue-950">KSH {m.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{m.count} transactions</p>
                </div>
              ))}
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

export default DailySales;
