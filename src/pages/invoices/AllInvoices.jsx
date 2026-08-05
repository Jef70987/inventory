import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Plus,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  X,
  MoreVertical
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

const AllInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoices = [
    { id: "INV-2026-001", customer: "John Doe", items: 3, total: 245.00, status: "Paid", date: "2026-08-05", dueDate: "2026-08-19", paymentMethod: "Cash" },
    { id: "INV-2026-002", customer: "Jane Smith", items: 2, total: 132.50, status: "Unpaid", date: "2026-08-05", dueDate: "2026-08-19", paymentMethod: "Card" },
    { id: "INV-2026-003", customer: "Robert Johnson", items: 5, total: 378.00, status: "Paid", date: "2026-08-04", dueDate: "2026-08-18", paymentMethod: "Mobile" },
    { id: "INV-2026-004", customer: "Mary Williams", items: 1, total: 56.00, status: "Overdue", date: "2026-07-25", dueDate: "2026-08-08", paymentMethod: "Cash" },
    { id: "INV-2026-005", customer: "Michael Brown", items: 2, total: 92.50, status: "Pending", date: "2026-08-03", dueDate: "2026-08-17", paymentMethod: "Card" },
    { id: "INV-2026-006", customer: "Sarah Davis", items: 4, total: 189.00, status: "Paid", date: "2026-08-03", dueDate: "2026-08-17", paymentMethod: "Mobile" },
    { id: "INV-2026-007", customer: "David Wilson", items: 3, total: 215.00, status: "Unpaid", date: "2026-08-02", dueDate: "2026-08-16", paymentMethod: "Bank" }
  ];

  // Chart Data
  const invoiceStatusData = {
    labels: ['Paid', 'Unpaid', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [3, 2, 1, 1],
        backgroundColor: ['#166534', '#f97316', '#1e3a5f', '#991b1b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const invoiceRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Invoiced Amount',
        data: [18500, 22000, 19500, 28000, 32000, 29000, 35000],
        backgroundColor: '#1e3a5f',
        borderRadius: 0
      },
      {
        label: 'Paid Amount',
        data: [15000, 18000, 16500, 24000, 28000, 25000, 31000],
        backgroundColor: '#166534',
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
      'Paid': 'bg-green-800 text-white',
      'Unpaid': 'bg-orange-600 text-white',
      'Pending': 'bg-blue-950 text-white',
      'Overdue': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <CheckCircle size={14} />;
      case 'Unpaid': return <Clock size={14} />;
      case 'Pending': return <RefreshCw size={14} />;
      case 'Overdue': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedInvoice(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedInvoice(null);
  };

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  const handleView = (invoice) => {
    showCustomModal(
      `Invoice: ${invoice.id}\nCustomer: ${invoice.customer}\nTotal: $${invoice.total.toFixed(2)}\nStatus: ${invoice.status}\nDate: ${invoice.date}\nDue: ${invoice.dueDate}`,
      "info",
      invoice
    );
  };

  const handlePrint = (invoice) => {
    showCustomModal(`Printing invoice ${invoice.id}`, "success", invoice);
  };

  const handleDownload = (invoice) => {
    showCustomModal(`Downloading invoice ${invoice.id} as PDF`, "success", invoice);
  };

  const handleExport = () => {
    showCustomModal("All invoices exported successfully!", "success");
  };

  const handleMarkPaid = (invoice) => {
    showCustomModal(`Invoice ${invoice.id} marked as PAID`, "success", invoice);
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
              {selectedInvoice && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">Invoice: {selectedInvoice.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedInvoice.customer}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedInvoice.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedInvoice.status}</p>
                  <p className="text-sm text-gray-600">Due: {selectedInvoice.dueDate}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">All Invoices</h1>
          <p className="text-gray-600 font-medium text-sm">Manage and track all customer invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/invoices/create">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Create Invoice</span>
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
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-950">{totalInvoices}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <FileText size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-bold text-green-800">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Paid</p>
              <p className="text-2xl font-bold text-orange-600">${paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-red-800">{overdueCount}</p>
            </div>
            <div className="bg-red-800 p-2 border-2 border-white/20">
              <AlertCircle size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Status Distribution</h2>
          <div className="h-52">
            <Doughnut data={invoiceStatusData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice vs Paid Amount</h2>
          <div className="h-52">
            <Bar data={invoiceRevenueData} options={barOptions} />
          </div>
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
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Payment</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Mobile</option>
            <option>Bank</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Apply
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice #</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Payment</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Due Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{invoice.id}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{invoice.customer}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-medium">{invoice.items}</td>
                <td className="py-3 px-4 font-bold text-blue-950">${invoice.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{invoice.paymentMethod}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">{invoice.dueDate}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(invoice)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(invoice)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                    {invoice.status !== 'Paid' && (
                      <button
                        onClick={() => handleMarkPaid(invoice)}
                        className="text-green-800 hover:text-green-900 transition-colors text-xs font-bold"
                      >
                        Mark Paid
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

export default AllInvoices;