import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Users,
  Package
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

const AllSales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const sales = [
    { id: "INV-2026-001", customer: "John Doe", items: 3, total: 245.00, payment: "Cash", status: "Completed", date: "2026-08-05", time: "14:30" },
    { id: "INV-2026-002", customer: "Jane Smith", items: 2, total: 132.50, payment: "Card", status: "Processing", date: "2026-08-05", time: "11:15" },
    { id: "INV-2026-003", customer: "Robert Johnson", items: 5, total: 378.00, payment: "Mobile", status: "Completed", date: "2026-08-04", time: "16:45" },
    { id: "INV-2026-004", customer: "Mary Williams", items: 1, total: 56.00, payment: "Cash", status: "Refunded", date: "2026-08-04", time: "09:30" },
    { id: "INV-2026-005", customer: "Michael Brown", items: 2, total: 92.50, payment: "Card", status: "Pending", date: "2026-08-03", time: "13:20" },
    { id: "INV-2026-006", customer: "Sarah Davis", items: 4, total: 189.00, payment: "Mobile", status: "Completed", date: "2026-08-03", time: "10:00" }
  ];

  // Chart Data
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [1250, 1800, 1450, 2100, 1950, 2300, 2800],
        backgroundColor: '#1e3a5f',
        borderRadius: 0,
        borderColor: '#1e3a5f',
        borderWidth: 1
      },
      {
        label: 'Target',
        data: [1500, 1500, 1500, 1500, 1500, 1500, 1500],
        backgroundColor: '#f97316',
        borderRadius: 0,
        borderColor: '#f97316',
        borderWidth: 1
      }
    ]
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue 2025',
        data: [18500, 22000, 19500, 28000, 32000, 29000, 35000],
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

  const paymentDistributionData = {
    labels: ['Cash', 'Card', 'Mobile', 'Bank Transfer'],
    datasets: [
      {
        data: [45, 30, 20, 5],
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
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

  const lineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { ...chartOptions.plugins.legend, position: 'top' }
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

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Processing': 'bg-blue-950 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Refunded': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={14} />;
      case 'Processing': return <RefreshCw size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Refunded': return <XCircle size={14} />;
      default: return null;
    }
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedSale(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedSale(null);
  };

  const totalSales = sales.length;
  const totalRevenue = sales
    .filter(s => s.status !== 'Refunded')
    .reduce((sum, s) => sum + s.total, 0);
  const completedCount = sales.filter(s => s.status === 'Completed').length;

  const handlePrint = (sale) => {
    showCustomModal(`Printing invoice ${sale.id}`, "info", sale);
  };

  const handleView = (sale) => {
    showCustomModal(
      `Invoice: ${sale.id}\nCustomer: ${sale.customer}\nTotal: $${sale.total.toFixed(2)}\nStatus: ${sale.status}\nDate: ${sale.date}`,
      "info",
      sale
    );
  };

  const handleExport = () => {
    showCustomModal("Sales data exported successfully!", "success");
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
                {modalType === "error" && <XCircle size={28} className="text-red-800" />}
                {modalType === "info" && <AlertCircle size={28} className="text-blue-950" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : modalType === "error" ? "Error" : "Information"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
              {selectedSale && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">Invoice: {selectedSale.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedSale.customer}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedSale.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedSale.status}</p>
                </div>
              )}
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
          <h1 className="text-2xl font-bold text-blue-950">All Sales</h1>
          <p className="text-gray-600 font-medium text-sm">Complete sales history and transaction records</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sales/pos">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ShoppingCart size={18} />
              <span className="text-sm">New Sale</span>
            </button>
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-bold text-blue-950">{totalSales}</p>
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
              <p className="text-2xl font-bold text-green-800">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-orange-600">{completedCount}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Order Value</p>
              <p className="text-2xl font-bold text-blue-950">${(totalRevenue / totalSales).toFixed(2)}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Users size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue Trend</h2>
          <div className="h-56">
            <Line data={revenueChartData} options={lineOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Payment Methods</h2>
          <div className="h-56">
            <Doughnut data={paymentDistributionData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Sales Chart */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Weekly Sales Performance</h2>
        <div className="h-48">
          <Bar data={salesChartData} options={chartOptions} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice number or customer..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Status</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Refunded</option>
          </select>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Payment</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Mobile</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Apply
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Payment</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{sale.id}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{sale.customer}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-medium">{sale.items}</td>
                <td className="py-3 px-4 font-bold text-blue-950">${sale.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{sale.payment}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(sale.status)}`}>
                    {getStatusIcon(sale.status)}
                    {sale.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{sale.date} {sale.time}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(sale)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(sale)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllSales;