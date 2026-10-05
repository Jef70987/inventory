import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Search, Plus, Minus, Save, CheckCircle, AlertCircle,
  Loader2, Package, Warehouse as WarehouseIcon, History
} from "lucide-react";
import { Link } from "react-router-dom";

const StockAdjustment = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [direction, setDirection] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reasons = [
    "Stock Count Correction",
    "Damaged Goods",
    "Returns",
    "Supplier Credit",
    "Theft/Loss",
    "Expired Products",
    "Opening Stock",
    "Other",
  ];

  useEffect(() => {
    (async () => {
      try {
        const [p, w, a] = await Promise.all([
          invoke("list_products", { search: null, categoryId: null, onlyActive: true }),
          invoke("list_warehouses"),
          invoke("list_stock_adjustments", { limit: 20 }),
        ]);
        setProducts(p);
        setWarehouses(w);
        setAdjustments(a);
        const def = w.find(x => x.is_default);
        if (def) setSelectedWarehouse(def.id);
        else if (w.length > 0) setSelectedWarehouse(w[0].id);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!selectedProduct) { setError("Please select a product."); return; }
    if (!selectedWarehouse) { setError("Please select a warehouse."); return; }
    if (!reason) { setError("Please select a reason."); return; }
    if (quantity <= 0) { setError("Quantity must be greater than zero."); return; }

    setSaving(true);
    try {
      await invoke("adjust_stock", {
        warehouseId: selectedWarehouse,
        productId: selectedProduct.id,
        direction,
        quantity: Number(quantity),
        reason,
        notes: notes.trim() || null,
        userId: JSON.parse(localStorage.getItem("user") || "{}")?.id || null,
      });
      setSuccess(`${direction === "add" ? "Added" : "Removed"} ${quantity} × ${selectedProduct.name}`);
      setSelectedProduct(null);
      setQuantity(1);
      setReason("");
      setNotes("");
      // Refresh recent adjustments
      const a = await invoke("list_stock_adjustments", { limit: 20 });
      setAdjustments(a);
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not adjust stock.");
    } finally {
      setSaving(false);
    }
  };

  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || "—";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-blue-950" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Stock Adjustment</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">
            Add or remove stock with a reason (damage, recount, opening stock, etc.)
          </p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
        </Link>
      </div>

      {(error || success) && (
        <div className={`mb-4 p-3 border-l-4 flex items-start gap-2 ${
          error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-800"
        }`}>
          {error ? <AlertCircle size={16} className="text-red-600 mt-0.5" /> : <CheckCircle size={16} className="text-green-800 mt-0.5" />}
          <p className={`text-xs font-bold ${error ? "text-red-800" : "text-green-800"}`}>{error || success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product picker */}
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">1. Select Product</h2>
            <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 mb-3">
              <Search size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search by name or SKU..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm font-medium text-blue-950 outline-none" />
            </div>

            {selectedProduct ? (
              <div className="p-3 bg-orange-50 border-l-4 border-orange-500 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-950">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-600 font-medium">SKU: {selectedProduct.sku} · Stock: {selectedProduct.total_stock}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)}
                  className="text-xs font-bold text-red-800 hover:text-red-900 uppercase tracking-wider">
                  Change
                </button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border-2 border-blue-950/10">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm font-medium">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <button key={p.id} onClick={() => setSelectedProduct(p)}
                      className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-950 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 font-medium">SKU: {p.sku} · {p.category_name || "—"}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-950">Stock: {p.total_stock}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Direction + warehouse */}
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">2. Adjustment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Warehouse</label>
                <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}{w.is_default ? " (default)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDirection("add")}
                    className={`flex-1 py-2 font-bold text-sm border-2 transition-colors flex items-center justify-center gap-1 ${
                      direction === "add"
                        ? "bg-green-800 text-white border-green-800"
                        : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                    }`}>
                    <Plus size={14} /> Add
                  </button>
                  <button type="button" onClick={() => setDirection("remove")}
                    className={`flex-1 py-2 font-bold text-sm border-2 transition-colors flex items-center justify-center gap-1 ${
                      direction === "remove"
                        ? "bg-red-800 text-white border-red-800"
                        : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                    }`}>
                    <Minus size={14} /> Remove
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Quantity</label>
                <input type="number" min="1" value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reason *</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                  <option value="">Select a reason</option>
                  {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Optional" />
              </div>
            </div>

            <button type="button" onClick={submit}
              disabled={saving || !selectedProduct}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Apply Adjustment</>}
            </button>
          </div>
        </div>

        {/* Sidebar — Recent */}
        <div>
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
              <History size={18} /> Recent
            </h2>
            {adjustments.length === 0 ? (
              <p className="text-xs text-gray-500 font-medium text-center py-6">
                No adjustments yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adjustments.map((a) => (
                  <div key={a.id} className={`border-l-4 p-3 bg-gray-50 ${
                    a.direction === "add" ? "border-green-800" : "border-red-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-950 text-sm">{a.product_name}</p>
                      <span className={`font-bold text-sm ${
                        a.direction === "add" ? "text-green-800" : "text-red-800"
                      }`}>
                        {a.direction === "add" ? "+" : "-"}{a.quantity}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium">{a.warehouse_name}</p>
                    <p className="text-[10px] text-gray-500">{a.reason || "—"}</p>
                    <p className="text-[10px] text-gray-400">{a.created_at?.slice(0, 16).replace("T", " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
