import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  BarChart3,
  Percent,
  Eye
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

const ProfitMargin = () => {
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const productMargins = [
    { name: "Circular Saw", sku: "TOOL-025", price: 189.00, cost: 95.00, margin: 49.7, revenue: 2850 },
    { name: "Hammer", sku: "TOOL-001", price: 24.99, cost: 12.50, margin: 50.0, revenue: 3425 },
    { name: "Level Tool", sku: "TOOL-008", price: 34.50, cost: 16.00, margin: 53.6, revenue: 980 },
    { name: "Screwdriver Set", sku: "TOOL-005", price: 45.00, cost: 22.00, margin: 51.1, revenue: 2340 },
    { name: "Paint Roller", sku: "PAINT-003", price: 12.50, cost: 6.00, margin: 52.0, revenue: 1850 },
    { name: "Drill Bits", sku: "TOOL-018", price: 18.75, cost: 9.00, margin: 52.0, revenue: 1675 },
    { name: "Paint Brush Set", sku: "PAINT-001", price: 15.99, cost: 7.50, margin: 53.1, revenue: 1230 },
    { name: "Measuring Tape", sku: "TOOL-012", price: 8.99, cost: 4.00, margin: 55.5, revenue: 1450 }
  ];

  const categoryMargins = {
    labels: ['Tools', 'Power Tools', 'Paint', 'Plumbing', 'Electrical'],
    datasets: [
      {
        label: 'Margin %',
        data: [52, 49, 53, 45, 48],
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95'],
        borderRadius: 0,
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const marginChartData = {
    labels: productMargins.slice(0, 6).map(p => p.name),
    datasets: [
      {
        label: 'Margin %',
        data: productMargins.slice(0, 6).map(p => p.margin),
        backgroundColor: '#1e3a5f',
        borderRadius: 0,
        borderColor: '#1e3a5f',
        borderWidth: 1
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
    showCustomModal("Profit margin report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Profit margin report sent to printer!", "success");
  };

  const getMarginColor = (margin) => {
    if (margin >= 50) return 'text-green-800';
    if (margin >= 40) return 'text-orange-600';
    return 'text-red-800';
  };

  const getMarginBg = (margin) => {
    if (margin >= 50) return 'bg-green-800 text-white';
    if (margin >= 40) return 'bg-orange-600 text-white';
    return 'bg-red-800 text-white';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Profit Margin Analysis</h1>
          <p className="text-gray-600 font-medium text-sm">Analyze profit margins across products and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <Printer size={18} />
            <span className="text-sm">Print</span>
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
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
                  period === p ? 'bg-blue-950 text-white border-blue-950' : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950 ml-auto">
            Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Margin</p>
              <p className="text-2xl font-bold text-blue-950">51.8%</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Percent size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Highest Margin</p>
              <p className="text-2xl font-bold text-green-800">55.5%</p>
              <p className="text-xs text-gray-500">Measuring Tape</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <TrendingUp size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Lowest Margin</p>
              <p className="text-2xl font-bold text-orange-600">49.7%</p>
              <p className="text-xs text-gray-500">Circular Saw</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <TrendingDown size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Profit</p>
              <p className="text-2xl font-bold text-blue-950">$15,825</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Product Margins</h2>
          <div className="h-64">
            <Bar data={marginChartData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Category Margins</h2>
          <div className="h-64">
            <Bar data={categoryMargins} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Cost</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Margin %</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Revenue</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Profit</th>
            </tr>
          </thead>
          <tbody>
            {productMargins.map((product, index) => {
              const profit = product.revenue * (product.margin / 100);
              return (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-600 font-medium">${product.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 text-xs font-bold ${getMarginBg(product.margin)}`}>
                      {product.margin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">${product.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-800">${profit.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitMargin;