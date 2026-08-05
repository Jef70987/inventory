import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const SalesReports = () => {
  const [dateRange, setDateRange] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  // Chart Data
  const salesTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000],
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e3a5f',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const salesByCategoryData = {
    labels: ['Tools', 'Paint', 'Power Tools', 'Plumbing', 'Electrical', 'Wood'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [8500, 4200, 6800, 3100, 2900, 1800],
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const monthlyComparisonData = {
    labels: ['Jul', 'Aug'],
    datasets: [
      {
        label: '2024',
        data: [22000, 25000],
        backgroundColor: '#94a3b8',
        borderRadius: 0
      },
      {
        label: '2025',
        data: [35000, 38000],
        backgroundColor: '#1e3a5f',
        borderRadius: 0
      }
    ]
  };

  const lineOptions = {
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

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
        }
      }
    },
    cutout: '60%'
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
    showCustomModal("Report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Report sent to printer!", "success");
  };

  const stats = [
    { label: "Total Revenue", value: "$38,245", change: "+12.5%", trend: "up", icon: DollarSign },
    { label: "Total Sales", value: "847", change: "+8.2%", trend: "up", icon: ShoppingCart },
    { label: "Average Order", value: "$45.16", change: "+3.7%", trend: "up", icon: TrendingUp },
    { label: "Total Customers", value: "423", change: "+5.1%", trend: "up", icon: Users }
  ];

  const recentTransactions = [
    { id: "INV-2026-001", customer: "John Doe", amount: "$245.00", status: "Completed", date: "2026-08-05" },
    { id: "INV-2026-002", customer: "Jane Smith", amount: "$132.50", status: "Pending", date: "2026-08-05" },
    { id: "INV-2026-003", customer: "Robert Johnson", amount: "$378.00", status: "Completed", date: "2026-08-04" },
    { id: "INV-2026-004", customer: "Mary Williams", amount: "$56.00", status: "Refunded", date: "2026-08-04" },
    { id: "INV-2026-005", customer: "Michael Brown", amount: "$92.50", status: "Completed", date: "2026-08-03" }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'text-green-800',
      'Pending': 'text-orange-600',
      'Refunded': 'text-red-800'
    };
    return colors[status] || 'text-gray-600';
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
          <h1 className="text-2xl font-bold text-blue-950">Sales Reports</h1>
          <p className="text-gray-600 font-medium text-sm">Comprehensive sales analytics and performance metrics</p>
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
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Date Range:</span>
          </div>
          <div className="flex gap-1">
            {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                className={`px-4 py-1 text-sm font-bold capitalize border-2 transition-colors ${
                  dateRange === range
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setDateRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
            <span className="text-gray-500 font-medium">to</span>
            <input type="date" className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
            <button className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-950">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp size={14} className="text-green-800" />
                  ) : (
                    <TrendingDown size={14} className="text-red-800" />
                  )}
                  <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-800' : 'text-red-800'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-xs font-medium">vs last period</span>
                </div>
              </div>
              <div className="bg-blue-950 p-3 border-2 border-white/20">
                <stat.icon size={20} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Sales Trend</h2>
          <div className="h-64">
            <Line data={salesTrendData} options={lineOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Sales by Category</h2>
          <div className="h-64">
            <Doughnut data={salesByCategoryData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Year Over Year Comparison</h2>
        <div className="h-56">
          <Bar data={monthlyComparisonData} options={barOptions} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm">
        <div className="p-5 border-b-2 border-blue-950/10">
          <h2 className="text-lg font-bold text-blue-950">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{transaction.id}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{transaction.customer}</td>
                  <td className="py-3 px-4 font-bold text-blue-950">{transaction.amount}</td>
                  <td className={`py-3 px-4 font-bold ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;