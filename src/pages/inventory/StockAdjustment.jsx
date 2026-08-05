import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus,
  Save,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

const StockAdjustment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState("add");
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const products = [
    { id: 1, name: "Hammer", sku: "TOOL-001", currentStock: 145, category: "Tools" },
    { id: 2, name: "Paint Roller", sku: "PAINT-003", currentStock: 8, category: "Paint" },
    { id: 3, name: "Screwdriver Set", sku: "TOOL-005", currentStock: 0, category: "Tools" },
    { id: 4, name: "Drill Bits", sku: "TOOL-018", currentStock: 7, category: "Tools" },
    { id: 5, name: "Measuring Tape", sku: "TOOL-012", currentStock: 3, category: "Tools" },
    { id: 6, name: "Circular Saw", sku: "TOOL-025", currentStock: 32, category: "Power Tools" }
  ];

  const reasons = [
    "Stock Count Correction",
    "Damaged Goods",
    "Returns",
    "Supplier Credit",
    "Theft/Loss",
    "Expired Products",
    "Other"
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setAdjustQuantity(1);
    setReason("");
  };

  const handleAddAdjustment = () => {
    if (!selectedProduct || !reason || adjustQuantity <= 0) return;

    const newAdjustment = {
      id: Date.now(),
      product: selectedProduct.name,
      sku: selectedProduct.sku,
      type: adjustType,
      quantity: adjustQuantity,
      reason: reason,
      date: new Date().toISOString().split('T')[0],
      status: "Pending"
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setSelectedProduct(null);
    setAdjustQuantity(1);
    setReason("");
    setSearchTerm("");
  };

  const getTypeColor = (type) => {
    return type === "add" ? "text-green-800" : "text-red-800";
  };

  const getTypeLabel = (type) => {
    return type === "add" ? "Added" : "Removed";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Stock Adjustment</h1>
          <p className="text-gray-600 font-medium text-sm">Adjust inventory levels for corrections, damages, or returns</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Products</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Select Product</h2>
            <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search product by name or SKU..."
                className="px-2 py-2 text-sm outline-none font-medium text-blue-950 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <div className="border-2 border-blue-950/10 mt-2 max-h-48 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedProduct?.id === product.id ? 'bg-blue-950/5 border-l-4 border-blue-950' : ''
                      }`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-blue-950">{product.name}</p>
                          <p className="text-xs text-gray-600 font-medium">SKU: {product.sku} | {product.category}</p>
                        </div>
                        <span className="font-bold text-blue-950">Stock: {product.currentStock}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-600 font-medium">No products found</div>
                )}
              </div>
            )}
          </div>

          {/* Adjustment Form */}
          {selectedProduct && (
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Adjustment Details</h2>
              <div className="bg-gray-50 p-3 mb-4 border-l-4 border-blue-950">
                <p className="font-bold text-blue-950">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600 font-medium">SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.currentStock}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Adjustment Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2 font-bold text-sm border-2 transition-colors ${
                        adjustType === "add" 
                          ? "bg-green-800 text-white border-green-800" 
                          : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                      }`}
                      onClick={() => setAdjustType("add")}
                    >
                      <Plus size={16} className="inline mr-1" />
                      Add
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 font-bold text-sm border-2 transition-colors ${
                        adjustType === "remove" 
                          ? "bg-red-800 text-white border-red-800" 
                          : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                      }`}
                      onClick={() => setAdjustType("remove")}
                    >
                      <Minus size={16} className="inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="">Select Reason</option>
                    {reasons.map((r, index) => (
                      <option key={index} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddAdjustment}
                disabled={!reason || adjustQuantity <= 0}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Add Adjustment
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Recent Adjustments */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Recent Adjustments</h2>
            {adjustments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adjustments.map((adj) => (
                  <div key={adj.id} className="border-l-4 border-blue-950 p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-950 text-sm">{adj.product}</p>
                      <span className={`font-bold text-sm ${getTypeColor(adj.type)}`}>
                        {adj.type === "add" ? '+' : '-'}{adj.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">{adj.reason}</p>
                        <p className="text-xs text-gray-500">{adj.date}</p>
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 font-medium">No adjustments yet</p>
                <p className="text-sm text-gray-500">Select a product to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;