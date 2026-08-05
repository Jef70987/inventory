import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  Clock
} from "lucide-react";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const suppliers = [
    {
      id: 1,
      name: "ABC Supplies",
      contact: "John Smith",
      phone: "+1 234-567-8900",
      email: "info@abcsupplies.com",
      address: "123 Supply St, City Center",
      products: 124,
      rating: 4.8,
      leadTime: "3-5 days",
      status: "Active"
    },
    {
      id: 2,
      name: "XYZ Distributors",
      contact: "Sarah Johnson",
      phone: "+1 234-567-8901",
      email: "info@xyzdist.com",
      address: "456 Distribution Ave, Industrial Park",
      products: 89,
      rating: 4.2,
      leadTime: "5-7 days",
      status: "Active"
    },
    {
      id: 3,
      name: "Global Tools",
      contact: "Michael Brown",
      phone: "+1 234-567-8902",
      email: "info@globaltools.com",
      address: "789 Tools Blvd, Business District",
      products: 156,
      rating: 4.6,
      leadTime: "2-4 days",
      status: "Active"
    },
    {
      id: 4,
      name: "Local Hardware",
      contact: "Emily Davis",
      phone: "+1 234-567-8903",
      email: "info@localhardware.com",
      address: "101 Local Rd, Town Center",
      products: 67,
      rating: 3.9,
      leadTime: "1-3 days",
      status: "Inactive"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Inactive': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="text-orange-600 fill-orange-600" />);
    }
    // Remaining empty stars
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} size={14} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Suppliers</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all your suppliers and vendors</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
          <Plus size={18} />
          <span className="text-sm">Add Supplier</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Suppliers</p>
          <p className="text-2xl font-bold text-blue-950">4</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-800">3</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Products Supplied</p>
          <p className="text-2xl font-bold text-orange-600">436</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Rating</p>
          <p className="text-2xl font-bold text-blue-950">4.4</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Search size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Phone</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Products</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Rating</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-bold text-blue-950">{supplier.name}</p>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} />
                      Lead: {supplier.leadTime}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700 font-medium">{supplier.contact}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-sm flex items-center gap-1">
                  <Phone size={14} />
                  {supplier.phone}
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium text-sm flex items-center gap-1">
                  <Mail size={14} />
                  {supplier.email}
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.products}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {getRatingStars(supplier.rating)}
                    <span className="text-xs font-bold text-gray-600 ml-1">{supplier.rating}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </td>
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

export default Suppliers;