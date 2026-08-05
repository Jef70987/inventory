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
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DailySales = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  // Sample daily data
  const dailyData = {
    date: "2026-08-05",
    totalSales: 847,
    totalRevenue: 8245.50,
    averageOrder: 45.16,
    totalCustomers: 342,
    topProducts: [
      { name: "Hammer", quantity: 45, revenue: 1124.55 },
      { name: "Paint Roller", quantity: 32, revenue: 400.00 },
      { name: "Screwdriver Set", quantity: 28, revenue: 1260.00 },
      { name: "Drill Bits", quantity: 25, revenue: 468.75 },
      { name: "Measuring Tape", quantity: 22, revenue: 197.78 }
    ],
    hourlySales: [
      { hour: "9AM", sales: 12 },
      { hour: "10AM", sales: 18 },
      { hour: "11AM", sales: 25 },
      { hour: "12PM", sales: 32 },
      { hour: "1PM", sales: 28 },
      { hour: "2PM", sales: 22 },
      { hour: "3PM", sales: 30 },
      { hour: "4PM", sales: 35 },
      { hour: "5PM", sales: 20 }
    ],
    paymentMethods: [
      { method: "Cash", amount: 3250.00, count: 45 },
      { method: "Card", amount: 2800.00, count: 32 },
      { method: "Mobile", amount: 1500.00, count: 18 },
      { method: "Bank", amount: 695.50, count: 8 }
    ]
  };

  const hourlyChartData = {
    labels: dailyData.hourlySales.map(h => h.hour),
    datasets: [
      {
        label: 'Sales',
        data: dailyData.hourlySales.map(h => h.sales),
        backgroundColor: '#1e3a5f',
        borderRadius: 0,
        borderColor: '#1e3a5f',
        borderWidth: 1
      }
    ]
  };

  const paymentChartData = {
    labels: dailyData.paymentMethods.map(p => p.method),
    datasets: [
      {
        data: dailyData.paymentMethods.map(p => p.amount),
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b'],
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
    showCustomModal("Daily sales report exported successfully!", "success");
  };

  const handlePrint = () => {
    showCustomModal("Daily sales report sent to printer!", "success");
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
          <h1 className="text-2xl font-bold text-blue-950">Daily Sales Report</h1>
          <p className="text-gray-600 font-medium text-sm">Detailed sales summary for a specific day</p>
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

      {/* Date Selector */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Select Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
          />
          <button className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            View Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-bold text-blue-950">{dailyData.totalSales}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <ShoppingCart size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Revenue</p>
              <p className="text-2xl font-bold text-green-800">${dailyData.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Order</p>
              <p className="text-2xl font-bold text-orange-600">${dailyData.averageOrder.toFixed(2)}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <TrendingUp size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Customers</p>
              <p className="text-2xl font-bold text-blue-950">{dailyData.totalCustomers}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Users size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Hourly Sales</h2>
          <div className="h-52">
            <Bar data={hourlyChartData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Payment Methods</h2>
          <div className="h-52">
            <Doughnut data={paymentChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="p-5 border-b-2 border-blue-950/10">
          <h2 className="text-lg font-bold text-blue-950">Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Quantity Sold</th>
                <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{product.quantity}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm">
        <div className="p-5 border-b-2 border-blue-950/10">
          <h2 className="text-lg font-bold text-blue-950">Payment Method Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
          {dailyData.paymentMethods.map((method, index) => (
            <div key={index} className="bg-gray-50 p-4 border-l-4 border-blue-950">
              <p className="text-xs text-gray-500 font-medium">{method.method}</p>
              <p className="text-xl font-bold text-blue-950">${method.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{method.count} transactions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailySales;