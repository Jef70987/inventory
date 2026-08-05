import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  Star,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

const SupplierPerformance = () => {
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const suppliers = [
    {
      id: 1,
      name: "ABC Supplies",
      totalOrders: 45,
      onTimeDelivery: 42,
      avgLeadTime: "3.2 days",
      totalSpend: 32500,
      rating: 4.8,
      qualityRate: 98,
      status: "Excellent"
    },
    {
      id: 2,
      name: "XYZ Distributors",
      totalOrders: 38,
      onTimeDelivery: 32,
      avgLeadTime: "5.1 days",
      totalSpend: 28900,
      rating: 4.2,
      qualityRate: 92,
      status: "Good"
    },
    {
      id: 3,
      name: "Global Tools",
      totalOrders: 52,
      onTimeDelivery: 48,
      avgLeadTime: "3.8 days",
      totalSpend: 45600,
      rating: 4.6,
      qualityRate: 96,
      status: "Excellent"
    },
    {
      id: 4,
      name: "Local Hardware",
      totalOrders: 25,
      onTimeDelivery: 18,
      avgLeadTime: "6.5 days",
      totalSpend: 12500,
      rating: 3.9,
      qualityRate: 85,
      status: "Average"
    },
    {
      id: 5,
      name: "Mega Store",
      totalOrders: 30,
      onTimeDelivery: 25,
      avgLeadTime: "4.5 days",
      totalSpend: 18900,
      rating: 4.0,
      qualityRate: 88,
      status: "Good"
    }
  ];

  const deliveryChartData = {
    labels: suppliers.map(s => s.name),
    datasets: [
      {
        label: 'On-Time Delivery %',
        data: suppliers.map(s => (s.onTimeDelivery / s.totalOrders) * 100),
        backgroundColor: ['#166534', '#1e3a5f', '#f97316', '#991b1b', '#4c1d95'],
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
        max: 100,
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
    showCustomModal("Supplier performance report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Supplier performance report sent to printer!", "success");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Excellent': 'bg-green-800 text-white',
      'Good': 'bg-blue-950 text-white',
      'Average': 'bg-orange-600 text-white',
      'Poor': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="text-orange-600 fill-orange-600" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} size={14} className="text-gray-300" />);
    }
    return stars;
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
          <h1 className="text-2xl font-bold text-blue-950">Supplier Performance</h1>
          <p className="text-gray-600 font-medium text-sm">Evaluate supplier reliability, quality, and performance metrics</p>
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
            {['month', 'quarter', 'year'].map((p) => (
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
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Suppliers</p>
              <p className="text-2xl font-bold text-blue-950">5</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Truck size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Rating</p>
              <p className="text-2xl font-bold text-green-800">4.3</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <Star size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-orange-600">190</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <Package size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl font-bold text-blue-950">$138,400</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">On-Time Delivery Performance</h2>
        <div className="h-64">
          <Bar data={deliveryChartData} options={barOptions} />
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Orders</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">On-Time</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Lead Time</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total Spend</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Rating</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Quality %</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{supplier.name}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.totalOrders}</td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold text-green-800">{supplier.onTimeDelivery}</span>
                  <span className="text-gray-500 text-xs"> ({((supplier.onTimeDelivery / supplier.totalOrders) * 100).toFixed(0)}%)</span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.avgLeadTime}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">${supplier.totalSpend.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {getRatingStars(supplier.rating)}
                    <span className="text-xs font-bold text-gray-600 ml-1">{supplier.rating}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-bold ${supplier.qualityRate >= 90 ? 'text-green-800' : supplier.qualityRate >= 80 ? 'text-orange-600' : 'text-red-800'}`}>
                    {supplier.qualityRate}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierPerformance;