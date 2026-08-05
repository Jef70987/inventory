import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  X
} from "lucide-react";

const PurchaseHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Sample customer data (in real app, fetch based on ID)
  const customer = {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    phone: "+1 234-567-8900",
    address: "123 Main St, City",
    joined: "2026-01-15",
    totalPurchases: 245.00,
    orders: 12
  };

  const purchases = [
    {
      id: "INV-2026-001",
      date: "2026-08-05",
      time: "14:30",
      items: 3,
      total: 245.00,
      payment: "Cash",
      status: "Completed",
      products: ["Hammer x2", "Paint Roller x1"]
    },
    {
      id: "INV-2026-002",
      date: "2026-07-28",
      time: "11:15",
      items: 2,
      total: 132.50,
      payment: "Card",
      status: "Completed",
      products: ["Screwdriver Set x1", "Drill Bits x1"]
    },
    {
      id: "INV-2026-003",
      date: "2026-07-15",
      time: "16:45",
      items: 5,
      total: 378.00,
      payment: "Mobile",
      status: "Completed",
      products: ["Circular Saw x1", "Hammer x3", "Measuring Tape x1"]
    },
    {
      id: "INV-2026-004",
      date: "2026-06-20",
      time: "09:30",
      items: 1,
      total: 56.00,
      payment: "Cash",
      status: "Refunded",
      products: ["Level Tool x1"]
    },
    {
      id: "INV-2026-005",
      date: "2026-06-05",
      time: "13:20",
      items: 2,
      total: 92.50,
      payment: "Card",
      status: "Completed",
      products: ["Paint Brush Set x2"]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Refunded': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Refunded': return <XCircle size={14} />;
      default: return null;
    }
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedPurchase(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedPurchase(null);
  };

  const handleView = (purchase) => {
    showCustomModal(
      `Invoice: ${purchase.id}\nDate: ${purchase.date}\nItems: ${purchase.items}\nTotal: $${purchase.total.toFixed(2)}\nStatus: ${purchase.status}\nPayment: ${purchase.payment}\nProducts: ${purchase.products.join(', ')}`,
      "info",
      purchase
    );
  };

  const handlePrint = (purchase) => {
    showCustomModal(`Printing invoice ${purchase.id}`, "success", purchase);
  };

  const handleExport = () => {
    showCustomModal("Purchase history exported successfully!", "success");
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
              {selectedPurchase && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">Invoice: {selectedPurchase.id}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedPurchase.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedPurchase.status}</p>
                  <p className="text-sm text-gray-600">Products: {selectedPurchase.products.join(', ')}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Purchase History</h1>
          <p className="text-gray-600 font-medium text-sm">View customer purchase history and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/customers/all">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Customers</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-blue-950" />
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Customer</p>
            </div>
            <p className="font-bold text-blue-950 text-lg">{customer.name}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail size={16} className="text-blue-950" />
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Email</p>
            </div>
            <p className="text-gray-700 font-medium">{customer.email}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Phone size={16} className="text-blue-950" />
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Phone</p>
            </div>
            <p className="text-gray-700 font-medium">{customer.phone}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-blue-950" />
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Total Spend</p>
            </div>
            <p className="font-bold text-green-800 text-lg">${customer.totalPurchases.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-blue-950">{customer.orders}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <ShoppingCart size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-green-800">4</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Customer Since</p>
              <p className="text-2xl font-bold text-orange-600">{customer.joined}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <Calendar size={20} color="white" />
            </div>
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
              placeholder="Search by invoice number or date..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Refunded</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            Filter
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Products</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Payment</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{purchase.id}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {purchase.date}
                  <br />
                  <span className="text-xs text-gray-400">{purchase.time}</span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {purchase.products.map((p, idx) => (
                    <div key={idx}>{p}</div>
                  ))}
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{purchase.items}</td>
                <td className="py-3 px-4 font-bold text-blue-950">${purchase.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{purchase.payment}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(purchase.status)}`}>
                    {getStatusIcon(purchase.status)}
                    {purchase.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(purchase)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(purchase)}
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

export default PurchaseHistory;