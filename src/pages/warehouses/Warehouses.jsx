import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Warehouse,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Package,
  Users,
  Building2
} from "lucide-react";

const Warehouses = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const warehouses = [
    { 
      id: 1, 
      name: "Main Warehouse", 
      location: "123 Main St, City Center", 
      manager: "John Smith",
      capacity: "5,000 sq ft",
      items: 1245,
      status: "Active",
      phone: "+1 234-567-8900",
      email: "main@inventory.com"
    },
    { 
      id: 2, 
      name: "North Distribution Center", 
      location: "456 North Ave, Industrial Park", 
      manager: "Sarah Johnson",
      capacity: "8,000 sq ft",
      items: 892,
      status: "Active",
      phone: "+1 234-567-8901",
      email: "north@inventory.com"
    },
    { 
      id: 3, 
      name: "South Storage Facility", 
      location: "789 South Blvd, Business District", 
      manager: "Michael Brown",
      capacity: "3,500 sq ft",
      items: 456,
      status: "Maintenance",
      phone: "+1 234-567-8902",
      email: "south@inventory.com"
    },
    { 
      id: 4, 
      name: "East Warehouse", 
      location: "101 East Road, Logistics Zone", 
      manager: "Emily Davis",
      capacity: "6,200 sq ft",
      items: 678,
      status: "Active",
      phone: "+1 234-567-8903",
      email: "east@inventory.com"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Maintenance': 'bg-orange-600 text-white',
      'Inactive': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Warehouses</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all your warehouse locations and facilities</p>
        </div>
        <Link to="/warehouses/add">
          <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Plus size={18} />
            <span className="text-sm">Add Warehouse</span>
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Warehouses</p>
          <p className="text-2xl font-bold text-blue-950">4</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-800">3</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-orange-600">3,271</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-950">22,700 sq ft</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search warehouses..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white border-2 border-blue-950/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-950 p-3 border-2 border-white/20">
                    <Warehouse size={24} color="white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950 text-lg">{warehouse.name}</h3>
                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <MapPin size={14} />
                      {warehouse.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(warehouse.status)}`}>
                  {warehouse.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-50 p-3">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Manager</p>
                  <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                    <Users size={14} />
                    {warehouse.manager}
                  </p>
                </div>
                <div className="bg-gray-50 p-3">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Items</p>
                  <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                    <Package size={14} />
                    {warehouse.items}
                  </p>
                </div>
                <div className="bg-gray-50 p-3">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Capacity</p>
                  <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                    <Building2 size={14} />
                    {warehouse.capacity}
                  </p>
                </div>
                <div className="bg-gray-50 p-3">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Contact</p>
                  <p className="font-bold text-blue-950 text-sm">{warehouse.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t-2 border-gray-100">
                <Link to={`/warehouses/${warehouse.id}`}>
                  <button className="text-blue-950 border-2 border-blue-950/20 px-3 py-1 text-sm font-bold hover:bg-blue-950 hover:text-white transition-colors flex items-center gap-1">
                    <Eye size={14} />
                    View
                  </button>
                </Link>
                <button className="text-orange-600 border-2 border-orange-600/20 px-3 py-1 text-sm font-bold hover:bg-orange-600 hover:text-white transition-colors flex items-center gap-1">
                  <Edit size={14} />
                  Edit
                </button>
                <Link to="/warehouses/transfers">
                  <button className="bg-blue-950 text-white px-3 py-1 text-sm font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-1">
                    <Package size={14} />
                    Transfer
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Warehouses;