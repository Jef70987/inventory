import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, X, MapPin, Phone, Mail, Building2, User } from "lucide-react";

const AddWarehouse = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    manager: "",
    phone: "",
    email: "",
    capacity: "",
    status: "Active",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Warehouse Data:", formData);
    alert("Warehouse added successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Add Warehouse</h1>
          <p className="text-gray-600 font-medium text-sm">Create a new warehouse location</p>
        </div>
        <Link to="/warehouses/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Warehouses</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Warehouse Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Warehouse Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter warehouse name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Location</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <MapPin size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Manager</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <User size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Manager name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Capacity (sq ft)</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Building2 size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Phone size={18} className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Additional notes..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Add Warehouse
            </button>
            <button
              type="button"
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWarehouse;