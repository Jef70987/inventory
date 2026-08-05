import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  Package,
  AlertTriangle,
  PackageX
} from "lucide-react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    { id: 1, name: "Hammer", sku: "TOOL-001", category: "Tools", price: "$24.99", cost: "$12.50", stock: 145, reorder: 25, status: "In Stock", date: "2026-08-05" },
    { id: 2, name: "Paint Roller", sku: "PAINT-003", category: "Paint", price: "$12.50", cost: "$6.00", stock: 8, reorder: 15, status: "Low Stock", date: "2026-08-04" },
    { id: 3, name: "Screwdriver Set", sku: "TOOL-005", category: "Tools", price: "$45.00", cost: "$22.00", stock: 0, reorder: 20, status: "Out of Stock", date: "2026-08-03" },
    { id: 4, name: "Drill Bits", sku: "TOOL-018", category: "Tools", price: "$18.75", cost: "$9.00", stock: 7, reorder: 15, status: "Low Stock", date: "2026-08-03" },
    { id: 5, name: "Measuring Tape", sku: "TOOL-012", category: "Tools", price: "$8.99", cost: "$4.00", stock: 3, reorder: 20, status: "Low Stock", date: "2026-08-02" },
    { id: 6, name: "Circular Saw", sku: "TOOL-025", category: "Power Tools", price: "$189.00", cost: "$95.00", stock: 32, reorder: 10, status: "In Stock", date: "2026-08-02" },
    { id: 7, name: "Paint Brush Set", sku: "PAINT-001", category: "Paint", price: "$15.99", cost: "$7.50", stock: 45, reorder: 20, status: "In Stock", date: "2026-08-01" },
    { id: 8, name: "Level Tool", sku: "TOOL-008", category: "Tools", price: "$34.50", cost: "$16.00", stock: 22, reorder: 15, status: "In Stock", date: "2026-07-31" }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'In Stock': 'bg-green-800 text-white',
      'Low Stock': 'bg-orange-600 text-white',
      'Out of Stock': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">All Products</h1>
          <p className="text-gray-600 font-medium text-sm">Complete inventory list with stock status and details</p>
        </div>
        <Link to="/inventory/add-product">
          <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Plus size={18} />
            <span className="text-sm">Add Product</span>
          </button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-blue-950">2,847</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">In Stock</p>
          <p className="text-2xl font-bold text-green-800">2,103</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">42</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">18</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, SKU, or category..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
              <option>All Categories</option>
              <option>Tools</option>
              <option>Paint</option>
              <option>Power Tools</option>
              <option>Plumbing</option>
              <option>Electrical</option>
            </select>
            <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
              <option>All Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Filter size={16} />
              Apply
            </button>
            <button className="flex items-center gap-1 bg-white border-2 border-blue-950/20 px-3 py-1 text-blue-950 font-bold text-sm hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product Name</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Cost</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Stock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{product.category}</td>
                <td className="py-3 px-4 font-bold text-blue-950">{product.price}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{product.cost}</td>
                <td className="py-3 px-4">
                  <span className={`font-bold ${product.stock <= product.reorder ? 'text-red-800' : 'text-blue-950'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">{product.reorder}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(product.status)}`}>
                    {product.status}
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

        {/* Table Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-blue-950/10">
          <p className="text-sm text-gray-600 font-medium">Showing {filteredProducts.length} products</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-950 text-white font-bold text-sm border-2 border-blue-950">1</button>
            <button className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors">2</button>
            <button className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors">3</button>
            <button className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;