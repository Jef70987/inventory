import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck
} from "lucide-react";

const StockTransfers = () => {
  const [transfers, setTransfers] = useState([
    {
      id: 1,
      product: "Hammer",
      sku: "TOOL-001",
      from: "Main Warehouse",
      to: "North Distribution Center",
      quantity: 50,
      date: "2026-08-05",
      status: "Completed",
      transferredBy: "John Smith"
    },
    {
      id: 2,
      product: "Paint Roller",
      sku: "PAINT-003",
      from: "Main Warehouse",
      to: "South Storage Facility",
      quantity: 30,
      date: "2026-08-04",
      status: "Pending",
      transferredBy: "Sarah Johnson"
    },
    {
      id: 3,
      product: "Screwdriver Set",
      sku: "TOOL-005",
      from: "North Distribution Center",
      to: "East Warehouse",
      quantity: 25,
      date: "2026-08-03",
      status: "In Progress",
      transferredBy: "Michael Brown"
    },
    {
      id: 4,
      product: "Drill Bits",
      sku: "TOOL-018",
      from: "South Storage Facility",
      to: "Main Warehouse",
      quantity: 40,
      date: "2026-08-02",
      status: "Completed",
      transferredBy: "Emily Davis"
    }
  ]);

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    product: "",
    from: "",
    to: "",
    quantity: ""
  });

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'In Progress': 'bg-blue-950 text-white',
      'Cancelled': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={16} />;
      case 'Pending': return <Clock size={16} />;
      case 'In Progress': return <Truck size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const transfer = {
      id: transfers.length + 1,
      ...newTransfer,
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
      transferredBy: "Current User"
    };
    setTransfers([transfer, ...transfers]);
    setShowTransferForm(false);
    setNewTransfer({ product: "", from: "", to: "", quantity: "" });
    alert("Transfer created successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Stock Transfers</h1>
          <p className="text-gray-600 font-medium text-sm">Move stock between warehouse locations</p>
        </div>
        <button
          onClick={() => setShowTransferForm(!showTransferForm)}
          className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
        >
          <Plus size={18} />
          <span className="text-sm">New Transfer</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Transfers</p>
          <p className="text-2xl font-bold text-blue-950">{transfers.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-800">2</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-orange-600">1</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-950">1</p>
        </div>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Create Stock Transfer</h2>
          <form onSubmit={handleTransferSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Product</label>
                <input
                  type="text"
                  placeholder="Search product"
                  value={newTransfer.product}
                  onChange={(e) => setNewTransfer({...newTransfer, product: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">From</label>
                <select
                  value={newTransfer.from}
                  onChange={(e) => setNewTransfer({...newTransfer, from: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  required
                >
                  <option value="">Select Warehouse</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="North Distribution Center">North Distribution Center</option>
                  <option value="South Storage Facility">South Storage Facility</option>
                  <option value="East Warehouse">East Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">To</label>
                <select
                  value={newTransfer.to}
                  onChange={(e) => setNewTransfer({...newTransfer, to: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  required
                >
                  <option value="">Select Warehouse</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="North Distribution Center">North Distribution Center</option>
                  <option value="South Storage Facility">South Storage Facility</option>
                  <option value="East Warehouse">East Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newTransfer.quantity}
                  onChange={(e) => setNewTransfer({...newTransfer, quantity: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
              >
                Create Transfer
              </button>
              <button
                type="button"
                onClick={() => setShowTransferForm(false)}
                className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfers Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">From</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">To</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{transfer.product}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{transfer.sku}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{transfer.from}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{transfer.to}</td>
                <td className="py-3 px-4 font-bold text-blue-950">{transfer.quantity}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{transfer.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(transfer.status)}`}>
                    {getStatusIcon(transfer.status)}
                    {transfer.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-950 hover:text-blue-700 transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTransfers;