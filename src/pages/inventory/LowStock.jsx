import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Package,
  ShoppingCart,
  Clock,
  Eye
} from "lucide-react";

const LowStock = () => {
  const lowStockItems = [
    { id: 1, name: "Paint Roller", sku: "PAINT-003", currentStock: 8, reorderLevel: 15, reorderQuantity: 20, category: "Paint", supplier: "ABC Supplies", lastOrdered: "2026-07-28" },
    { id: 2, name: "Screwdriver Set", sku: "TOOL-005", currentStock: 0, reorderLevel: 20, reorderQuantity: 30, category: "Tools", supplier: "XYZ Distributors", lastOrdered: "2026-07-15" },
    { id: 3, name: "Drill Bits", sku: "TOOL-018", currentStock: 7, reorderLevel: 15, reorderQuantity: 25, category: "Tools", supplier: "Global Tools", lastOrdered: "2026-07-20" },
    { id: 4, name: "Measuring Tape", sku: "TOOL-012", currentStock: 3, reorderLevel: 20, reorderQuantity: 25, category: "Tools", supplier: "Local Hardware", lastOrdered: "2026-07-10" },
    { id: 5, name: "Paint Brush Set", sku: "PAINT-001", currentStock: 12, reorderLevel: 20, reorderQuantity: 30, category: "Paint", supplier: "ABC Supplies", lastOrdered: "2026-07-25" }
  ];

  const totalLowStock = lowStockItems.length;
  const urgentCount = lowStockItems.filter(item => item.currentStock === 0).length;
  const averageStock = Math.round(lowStockItems.reduce((sum, item) => sum + item.currentStock, 0) / totalLowStock);

  const getPriorityColor = (stock, reorder) => {
    const ratio = stock / reorder;
    if (stock === 0) return "bg-red-800 text-white";
    if (ratio < 0.3) return "bg-orange-600 text-white";
    return "bg-yellow-600 text-white";
  };

  const getPriorityLabel = (stock, reorder) => {
    const ratio = stock / reorder;
    if (stock === 0) return "Out of Stock";
    if (ratio < 0.3) return "Critical";
    if (ratio < 0.5) return "Low";
    return "Warning";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Low Stock Items</h1>
          <p className="text-gray-600 font-medium text-sm">Products that need immediate attention and reordering</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Products</span>
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{totalLowStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{urgentCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Stock Level</p>
          <p className="text-2xl font-bold text-blue-950">{averageStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Suppliers</p>
          <p className="text-2xl font-bold text-green-800">3</p>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Current Stock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder Level</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{item.name}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.sku}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>
                <td className="py-3 px-4">
                  <span className={`font-bold ${item.currentStock === 0 ? 'text-red-800' : 'text-orange-600'}`}>
                    {item.currentStock}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">{item.reorderLevel}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getPriorityColor(item.currentStock, item.reorderLevel)}`}>
                    {getPriorityLabel(item.currentStock, item.reorderLevel)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700 font-medium">{item.supplier}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="bg-orange-600 text-white px-3 py-1 text-xs font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600">
                      Reorder
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

export default LowStock;