import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle, Eye,
  ArrowUpRight, ArrowDownRight, Download, Calendar, Loader2
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { exportPDF } from "../../utils/exporters";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler, ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await invoke("report_dashboard");
      setData(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-blue-950" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        {error || "Dashboard unavailable."}
      </div>
    );
  }

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue (This Year)",
        data: data.revenue_2025,
        borderColor: "#1e3a5f",
        backgroundColor: "rgba(30, 58, 95, 0.1)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#1e3a5f",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Revenue (Last Year)",
        data: data.revenue_2024,
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.05)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#f97316",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales (KSH)",
        data: data.weekly_sales,
        backgroundColor: "#1e3a5f",
        borderRadius: 0,
        borderColor: "#1e3a5f",
        borderWidth: 1,
      },
      {
        label: "Target",
        data: [data.weekly_target, data.weekly_target, data.weekly_target, data.weekly_target, data.weekly_target, data.weekly_target, data.weekly_target],
        backgroundColor: "#f97316",
        borderRadius: 0,
        borderColor: "#f97316",
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: data.category_distribution.map(c => c.category_name),
    datasets: [{
      data: data.category_distribution.map(c => c.revenue),
      backgroundColor: ["#1e3a5f", "#f97316", "#166534", "#991b1b", "#4c1d95", "#1e293b"],
      borderColor: "#ffffff",
      borderWidth: 2,
    }],
  };

  const stats = [
    { title: "Total Revenue", value: `KSH ${data.total_revenue.toFixed(0)}`, icon: DollarSign, color: "bg-blue-950", borderColor: "border-blue-950" },
    { title: "Total Sales", value: data.total_sales, icon: ShoppingCart, color: "bg-orange-600", borderColor: "border-orange-600" },
    { title: "Total Products", value: data.total_products, icon: Package, color: "bg-green-800", borderColor: "border-green-800" },
    { title: "Low Stock Items", value: data.low_stock_count, icon: AlertTriangle, color: "bg-red-800", borderColor: "border-red-800" },
  ];

  const getStatusColor = (status) => ({
    completed: "bg-green-800 text-white",
    processing: "bg-blue-950 text-white",
    pending: "bg-orange-600 text-white",
    refunded: "bg-red-800 text-white",
    void: "bg-gray-700 text-white",
  }[status] || "bg-gray-700 text-white");

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 20, font: { weight: "bold", size: 11 } } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  const lineOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, position: "top" } },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { weight: "bold", size: 10 } } } },
    cutout: "65%",
  };

  const handleExport = async () => {
    try {
      await exportPDF(
        `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`,
        "Business Dashboard Snapshot",
        ["Metric", "Value"],
        [
          ["Total Revenue", `KSH ${data.total_revenue.toFixed(2)}`],
          ["Total Sales", data.total_sales],
          ["Total Products", data.total_products],
          ["Low Stock Items", data.low_stock_count],
          ["Today's Sales", data.quick_stats.today_sales_count],
          ["Today's Revenue", `KSH ${data.quick_stats.today_revenue.toFixed(2)}`],
          ["Avg Order Value", `KSH ${data.quick_stats.avg_order_value.toFixed(2)}`],
          ["Active Customers", data.quick_stats.active_customers],
        ],
        { generated: new Date().toLocaleString() }
      );
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not export PDF.");
    }
  };

  const monthRange = `${new Date().toLocaleString("en", { month: "short" })} 1 - ${new Date().toLocaleString("en", { month: "short" })} ${new Date().getDate()}`;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Dashboard</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Welcome back, Admin. Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm">
            <Calendar size={16} />
            <span>{monthRange}</span>
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 border-2 border-blue-950 text-xs sm:text-sm">
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white border-l-4 ${stat.borderColor} p-4 sm:p-5 shadow-sm`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-950 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 border-2 border-white/20 flex-shrink-0`}>
                <stat.icon size={20} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-blue-950">Revenue Trend</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Monthly revenue comparison (last vs current year)</p>
            </div>
          </div>
          <div className="h-56 sm:h-64">
            <Line data={revenueData} options={lineOptions} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-blue-950 mb-4">Product Categories</h2>
          <div className="h-56 sm:h-64">
            {data.category_distribution.length === 0 ? (
              <p className="text-center text-gray-500 font-medium text-xs py-16">No sales yet.</p>
            ) : (
              <Doughnut data={categoryData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Sales Chart & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="lg:col-span-3 bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-blue-950">Weekly Sales Performance</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Sales vs target (last 7 days)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-950 border border-blue-950"></span>
                <span className="text-xs font-medium text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-600 border border-orange-600"></span>
                <span className="text-xs font-medium text-gray-600">Target</span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-56">
            <Bar data={salesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-blue-950 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <Quick label="Today's Revenue" value={`KSH ${data.quick_stats.today_revenue.toFixed(2)}`} />
            <Quick label="Orders Today" value={data.quick_stats.today_sales_count} />
            <Quick label="Avg. Order Value" value={`KSH ${data.quick_stats.avg_order_value.toFixed(2)}`} />
            <Quick label="Active Customers" value={data.quick_stats.active_customers} last />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-blue-950">Recent Orders</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Latest transactions</p>
            </div>
            <Link to="/sales/all">
              <button className="text-orange-600 font-bold text-xs sm:text-sm hover:text-orange-800 flex items-center gap-1 flex-shrink-0">
                <Eye size={14} /> View All
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-blue-950/10">
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Receipt</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-center py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
                  <th className="text-right py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.length === 0 && (
                  <tr><td colSpan="6" className="py-6 text-center text-gray-500 text-xs font-medium">No sales yet.</td></tr>
                )}
                {data.recent_orders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-bold text-blue-950 text-xs whitespace-nowrap">{order.receipt_no}</td>
                    <td className="py-2 text-gray-700 font-medium whitespace-nowrap">{order.customer_name}</td>
                    <td className="py-2 text-gray-600 text-center">{order.items}</td>
                    <td className="py-2 font-bold text-blue-950 whitespace-nowrap">KSH {order.total.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs whitespace-nowrap">{order.sold_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-blue-950">Low Stock Alert</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Items below reorder level</p>
            </div>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {data.low_stock_items.length === 0 && (
              <p className="text-center text-gray-500 font-medium text-xs py-6">All products well-stocked.</p>
            )}
            {data.low_stock_items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-950 text-sm truncate">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-[10px] text-gray-600 font-medium">SKU: {item.sku}</span>
                    <span className="text-[10px] font-bold text-red-800">Stock: {item.stock}</span>
                    <span className="text-[10px] text-gray-500">Reorder: {item.reorder_level}</span>
                  </div>
                </div>
                <Link to="/inventory/stock-adjustment" className="flex-shrink-0">
                  <button className="bg-orange-600 text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold hover:bg-orange-700 border-2 border-orange-600">
                    Reorder
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <Link to="/inventory/low-stock">
            <button className="w-full mt-4 bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 border-2 border-blue-950 text-xs sm:text-sm">
              View All Low Stock
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Quick = ({ label, value, last }) => (
  <div className={`flex items-center justify-between ${last ? "" : "pb-3 border-b border-gray-100"}`}>
    <p className="text-gray-600 text-xs font-bold">{label}</p>
    <p className="text-lg font-bold text-blue-950">{value}</p>
  </div>
);

export default Dashboard;
