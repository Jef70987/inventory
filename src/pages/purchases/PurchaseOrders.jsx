import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Download,
  Printer
} from "lucide-react";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const purchaseOrders = [
    {
      id: "PO-2026-001",
      supplier: "ABC Supplies",
      date: "2026-08-05",
      total: "$3,245.00",
      items: 12,
      status: "Received",
      expected: "2026-08-08"
    },
    {
      id: "PO-2026-002",
      supplier: "XYZ Distributors",
      date: "2026-08-04",
      total: "$1,890.50",
      items: 8,
      status: "Pending",
      expected: "2026-08-10"
    },
    {
      id: "PO-2026-003",
      supplier: "Global Tools",
      date: "2026-08-03",
      total: "$4,567.00",
      items: 15,
      status: "Shipped",
      expected: "2026-08-07"
    },
    {
      id: "PO-2026-004",
      supplier: "Local Hardware",
      date: "2026-08-02",
      total: "$876.25",
      items: 5,
      status: "Pending",
      expected: "2026-08-12"
    },
    {
      id: "PO-2026-005",
      supplier: "Mega Store",
      date: "2026-08-01",
      total: "$2,345.00",
      items: 10,
      status: "Cancelled",
      expected: "2026-08-05"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Received': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Shipped': 'bg-blue-950 text-white',
      'Cancelled': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Received': return <CheckCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Purchase Orders</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all supplier purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/purchases/create">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Create PO</span>
            </button>
          </Link>
          <Link to="/purchases/receive">
            <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600">
              <Truck size={18} />
              <span className="text-sm">Receive Stock</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-blue-950">5</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Received</p>
          <p className="text-2xl font-bold text-green-800">1</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-orange-600">2</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold text-blue-950">$12,923.75</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search PO number or supplier..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Shipped</option>
            <option>Received</option>
            <option>Cancelled</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Apply
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">PO Number</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Expected</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{po.id}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{po.supplier}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{po.date}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-center">{po.items}</td>
                <td className="py-3 px-4 font-bold text-blue-950">{po.total}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(po.status)}`}>
                    {getStatusIcon(po.status)}
                    {po.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">{po.expected}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-950 hover:text-blue-700 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="text-orange-600 hover:text-orange-800 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-800 hover:text-red-900 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 transition-colors">
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

export default PurchaseOrders;