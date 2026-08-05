import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  ShoppingCart,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProducts = () => {
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const topProducts = [
    { name: "Hammer", sku: "TOOL-001", revenue: 3425.00, units: 145, margin: 45, status: "Best Seller", trend: "up" },
    { name: "Circular Saw", sku: "TOOL-025", revenue: 2850.00, units: 32, margin: 55, status: "Best Seller", trend: "up" },
    { name: "Screwdriver Set", sku: "TOOL-005", revenue: 2340.00, units: 98, margin: 38, status: "Popular", trend: "up" },
    { name: "Paint Roller", sku: "PAINT-003", revenue: 1850.00, units: 75, margin: 42, status: "Popular", trend: "down" },
    { name: "Drill Bits", sku: "TOOL-018", revenue: 1675.00, units: 120, margin: 35, status: "Trending", trend: "up" },
    { name: "Measuring Tape", sku: "TOOL-012", revenue: 1450.00, units: 210, margin: 30, status: "High Volume", trend: "up" },
    { name: "Paint Brush Set", sku: "PAINT-001", revenue: 1230.00, units: 85, margin: 40, status: "Popular", trend: "down" },
    { name: "Level Tool", sku: "TOOL-008", revenue: 980.00, units: 45, margin: 48, status: "Niche", trend: "up" }
  ];

  const chartData = {
    labels: topProducts.slice(0, 6).map(p => p.name),
    datasets: [
      {
        label: 'Revenue',
        data: topProducts.slice(0, 6).map(p => p.revenue),
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
        borderRadius: 0,
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 11 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const showCustomModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
  };

  const handleExport = () => {
    showCustomModal("Top products report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Top products report sent to printer!", "success");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Best Seller': 'bg-green-800 text-white',
      'Popular': 'bg-blue-950 text-white',
      'Trending': 'bg-orange-600 text-white',
      'High Volume': 'bg-purple-800 text-white',
      'Niche': 'bg-gray-700 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertCircle size={28} className="text-red-800" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : "Error"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
            </div>
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Top Selling Products</h1>
          <p className="text-gray-600 font-medium text-sm">Best performing products by revenue and volume</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            <span className="text-sm">Print</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/reports/sales">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Period:</span>
          </div>
          <div className="flex gap-1">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                className={`px-4 py-1 text-sm font-bold capitalize border-2 transition-colors ${
                  period === p
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white ml-auto">
            <option>All Categories</option>
            <option>Tools</option>
            <option>Paint</option>
            <option>Power Tools</option>
          </select>
          <button className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            Apply
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue by Product</h2>
        <div className="h-64">
          <Bar data={chartData} options={barOptions} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Revenue</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Units Sold</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Margin %</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">${product.revenue.toFixed(2)}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{product.units}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{product.margin}%</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {product.trend === 'up' ? (
                    <TrendingUp size={18} className="text-green-800" />
                  ) : (
                    <TrendingDown size={18} className="text-red-800" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;