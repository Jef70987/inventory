import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Filter
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
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
  ArcElement
);

const PeriodReports = () => {
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("8");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  // Period Data
  const periodData = {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000, 0, 0, 0, 0],
      orders: [120, 145, 130, 180, 210, 190, 230, 250, 0, 0, 0, 0],
      customers: [45, 52, 48, 65, 72, 68, 80, 85, 0, 0, 0, 0]
    },
    weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      revenue: [8500, 9200, 8800, 10500],
      orders: [58, 62, 55, 68],
      customers: [22, 25, 20, 28]
    }
  };

  const revenueChartData = {
    labels: periodData.monthly.labels,
    datasets: [
      {
        label: 'Revenue',
        data: periodData.monthly.revenue,
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

  const ordersChartData = {
    labels: periodData.monthly.labels,
    datasets: [
      {
        label: 'Orders',
        data: periodData.monthly.orders,
        backgroundColor: '#f97316',
        borderRadius: 0,
        borderColor: '#f97316',
        borderWidth: 1
      }
    ]
  };

  const growthData = {
    labels: ['Revenue', 'Orders', 'Customers'],
    datasets: [
      {
        label: 'Growth Rate (%)',
        data: [15.2, 12.8, 10.5],
        backgroundColor: ['#166534', '#1e3a5f', '#f97316'],
        borderColor: '#ffffff',
        borderWidth: 2
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 11 }
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
    showCustomModal("Period report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Period report sent to printer!", "success");
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' }
  ];

  const years = ['2025', '2024', '2023'];

  const stats = [
    { label: "Total Revenue", value: "$245,500", change: "+15.2%", trend: "up", icon: DollarSign },
    { label: "Total Orders", value: "1,638", change: "+12.8%", trend: "up", icon: ShoppingCart },
    { label: "Total Customers", value: "562", change: "+10.5%", trend: "up", icon: Users },
    { label: "Avg Order Value", value: "$149.88", change: "+5.3%", trend: "up", icon: TrendingUp }
  ];

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
          <h1 className="text-2xl font-bold text-blue-950">Period Reports</h1>
          <p className="text-gray-600 font-medium text-sm">Weekly, monthly, and yearly performance analysis</p>
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

      {/* Period Selector */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Period:</span>
          </div>
          <div className="flex gap-1">
            {['weekly', 'monthly', 'yearly'].map((p) => (
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
          {period !== 'yearly' && (
            <>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}
          {period === 'yearly' && (
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          <button className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            Generate
          </button>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue Trend</h2>
          <div className="h-56">
            <Line data={revenueChartData} options={lineOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Orders Trend</h2>
          <div className="h-56">
            <Bar data={ordersChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Growth Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 border-l-4 border-green-800">
            <p className="text-xs text-gray-500 font-medium">Revenue Growth</p>
            <p className="text-2xl font-bold text-green-800">+15.2%</p>
            <p className="text-sm text-gray-600">$32,500 increase</p>
          </div>
          <div className="bg-blue-50 p-4 border-l-4 border-blue-950">
            <p className="text-xs text-gray-500 font-medium">Order Growth</p>
            <p className="text-2xl font-bold text-blue-950">+12.8%</p>
            <p className="text-sm text-gray-600">185 more orders</p>
          </div>
          <div className="bg-orange-50 p-4 border-l-4 border-orange-600">
            <p className="text-xs text-gray-500 font-medium">Customer Growth</p>
            <p className="text-2xl font-bold text-orange-600">+10.5%</p>
            <p className="text-sm text-gray-600">53 new customers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodReports;