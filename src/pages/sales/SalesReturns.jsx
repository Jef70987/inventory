import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Package,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  X,
  Printer,
  Download
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

const SalesReturns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);

  const returns = [
    { id: "RET-2026-001", invoice: "INV-2026-004", customer: "Mary Williams", product: "Hammer", quantity: 1, amount: 24.99, reason: "Damaged item", status: "Approved", date: "2026-08-05", refundMethod: "Cash" },
    { id: "RET-2026-002", invoice: "INV-2026-002", customer: "Jane Smith", product: "Paint Roller", quantity: 1, amount: 12.50, reason: "Wrong color", status: "Pending", date: "2026-08-04", refundMethod: "Card" },
    { id: "RET-2026-003", invoice: "INV-2026-005", customer: "Michael Brown", product: "Screwdriver Set", quantity: 1, amount: 45.00, reason: "Defective product", status: "Rejected", date: "2026-08-03", refundMethod: "Mobile" },
    { id: "RET-2026-004", invoice: "INV-2026-003", customer: "Robert Johnson", product: "Drill Bits", quantity: 2, amount: 37.50, reason: "Not as described", status: "Processing", date: "2026-08-02", refundMethod: "Cash" }
  ];

  // Chart Data
  const returnStatusData = {
    labels: ['Approved', 'Pending', 'Processing', 'Rejected'],
    datasets: [
      {
        data: [1, 1, 1, 1],
        backgroundColor: ['#166534', '#f97316', '#1e3a5f', '#991b1b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const returnReasonsData = {
    labels: ['Damaged', 'Wrong Color', 'Defective', 'Not as Described'],
    datasets: [
      {
        label: 'Returns by Reason',
        data: [1, 1, 1, 1],
        backgroundColor: ['#1e3a5f', '#f97316', '#991b1b', '#4c1d95'],
        borderRadius: 0
      }
    ]
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

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Processing': 'bg-blue-950 text-white',
      'Rejected': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <CheckCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Processing': return <RefreshCw size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return null;
    }
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedReturn(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedReturn(null);
  };

  const totalReturns = returns.length;
  const approvedCount = returns.filter(r => r.status === 'Approved').length;
  const pendingCount = returns.filter(r => r.status === 'Pending' || r.status === 'Processing').length;
  const totalAmount = returns.reduce((sum, r) => sum + r.amount, 0);

  const handleApprove = (ret) => {
    showCustomModal(`Return ${ret.id} has been approved. Refund of $${ret.amount.toFixed(2)} processed.`, "success", ret);
  };

  const handleReject = (ret) => {
    showCustomModal(`Return ${ret.id} has been rejected.`, "error", ret);
  };

  const handleView = (ret) => {
    showCustomModal(
      `Return: ${ret.id}\nInvoice: ${ret.invoice}\nCustomer: ${ret.customer}\nProduct: ${ret.product}\nReason: ${ret.reason}\nAmount: $${ret.amount.toFixed(2)}\nStatus: ${ret.status}`,
      "info",
      ret
    );
  };

  const handleExport = () => {
    showCustomModal("Returns data exported successfully!", "success");
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
              {selectedReturn && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">Return: {selectedReturn.id}</p>
                  <p className="text-sm text-gray-600">Invoice: {selectedReturn.invoice}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedReturn.customer}</p>
                  <p className="text-sm text-gray-600">Amount: ${selectedReturn.amount.toFixed(2)}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Sales Returns</h1>
          <p className="text-gray-600 font-medium text-sm">Manage product returns and refunds</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/sales/all">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Sales</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Returns</p>
              <p className="text-2xl font-bold text-blue-950">{totalReturns}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Package size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-bold text-green-800">{approvedCount}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <Clock size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Refunded</p>
              <p className="text-2xl font-bold text-blue-950">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Return Status Distribution</h2>
          <div className="h-52">
            <Doughnut data={returnStatusData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Returns by Reason</h2>
          <div className="h-52">
            <Bar data={returnReasonsData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by return ID or customer..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Rejected</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Search size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Return ID</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reason</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => (
              <tr key={ret.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{ret.id}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{ret.invoice}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{ret.customer}</td>
                <td className="py-3 px-4 font-bold text-blue-950">{ret.product}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{ret.quantity}</td>
                <td className="py-3 px-4 font-bold text-blue-950">${ret.amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-sm">{ret.reason}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(ret.status)}`}>
                    {getStatusIcon(ret.status)}
                    {ret.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(ret)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    {ret.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(ret)}
                          className="text-green-800 hover:text-green-900 transition-colors text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(ret)}
                          className="text-red-800 hover:text-red-900 transition-colors text-xs font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {ret.status === 'Approved' && (
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Printer size={16} />
                      </button>
                    )}
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

export default SalesReturns;