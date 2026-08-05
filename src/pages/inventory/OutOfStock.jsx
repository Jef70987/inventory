import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  PackageX, 
  AlertCircle,
  Clock,
  Truck,
  Eye
} from "lucide-react";

const OutOfStock = () => {
  const outOfStockItems = [
    { id: 1, name: "Screwdriver Set", sku: "TOOL-005", category: "Tools", lastRestock: "2026-07-15", supplier: "XYZ Distributors", expectedRestock: "2026-08-10", salesLastMonth: 45 },
    { id: 2, name: "Circular Saw", sku: "TOOL-025", category: "Power Tools", lastRestock: "2026-07-01", supplier: "Global Tools", expectedRestock: "2026-08-15", salesLastMonth: 28 },
    { id: 3, name: "Level Tool", sku: "TOOL-008", category: "Tools", lastRestock: "2026-07-20", supplier: "Local Hardware", expectedRestock: "2026-08-08", salesLastMonth: 32 }
  ];

  const totalOutOfStock = outOfStockItems.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Out of Stock Items</h1>
          <p className="text-gray-600 font-medium text-sm">Products that are currently unavailable and need urgent reordering</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Products</span>
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{totalOutOfStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Days Out</p>
          <p className="text-2xl font-bold text-orange-600">12</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Lost Sales</p>
          <p className="text-2xl font-bold text-blue-950">$8,450</p>
        </div>
      </div>

      {/* Out of Stock Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Last Restock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Expected Restock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Sales/Month</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outOfStockItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{item.name}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.sku}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{item.lastRestock}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{item.supplier}</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-orange-600">{item.expectedRestock}</span>
                </td>
                <td className="py-3 px-4 font-bold text-blue-950">{item.salesLastMonth}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="bg-red-800 text-white px-3 py-1 text-xs font-bold hover:bg-red-900 transition-colors border-2 border-red-800 flex items-center gap-1">
                      <Truck size={14} />
                      Urgent Reorder
                    </button>
                    <button className="text-blue-950 hover:text-blue-700 transition-colors">
                      <Eye size={16} />
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

export default OutOfStock;