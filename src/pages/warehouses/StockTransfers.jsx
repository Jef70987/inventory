import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle, Clock,
  XCircle, Truck, Loader2, AlertCircle, X, Save, Search,
  Filter, ChevronDown, ChevronUp, Package
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const StockTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [form, setForm] = useState({ from: "", to: "", notes: "", items: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [t, w, p, c, b] = await Promise.all([
        invoke("list_transfers"),
        invoke("list_warehouses"),
        invoke("list_products", { search: null, categoryId: null, onlyActive: true }),
        invoke("list_categories"),
        invoke("list_brands"),
      ]);
      setTransfers(t);
      setWarehouses(w);
      setProducts(p);
      setCategories(c);
      setBrands(b);
      if (w.length >= 2) {
        setForm(f => ({
          ...f,
          from: f.from || w[0].id,
          to: f.to || w[1].id,
        }));
      }
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = (product) => {
    if (form.items.some(i => i.product_id === product.id)) return;
    setForm({
      ...form,
      items: [...form.items, {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        available: product.total_stock,
        quantity: 1,
      }],
    });
  };

  const updateItemQty = (pid, qty) => {
    setForm({
      ...form,
      items: form.items.map(i =>
        i.product_id === pid ? { ...i, quantity: Number(qty) || 0 } : i
      ),
    });
  };

  const removeItem = (pid) => {
    setForm({ ...form, items: form.items.filter(i => i.product_id !== pid) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.from || !form.to) { setError("Select both warehouses."); return; }
    if (form.from === form.to) { setError("Source and destination must be different."); return; }
    if (form.items.length === 0) { setError("Add at least one item."); return; }
    if (form.items.some(i => i.quantity <= 0)) { setError("All quantities must be > 0."); return; }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await invoke("create_transfer", {
        fromWarehouseId: form.from,
        toWarehouseId: form.to,
        notes: form.notes.trim() || null,
        userId: user?.id || null,
        items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      setSuccess("Transfer created.");
      setShowForm(false);
      setForm({ from: warehouses[0]?.id || "", to: warehouses[1]?.id || "", notes: "", items: [] });
      setSearchTerm(""); setFilterCategory(""); setFilterBrand("");
      await load();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create transfer.");
    } finally {
      setSaving(false);
    }
  };

  const completeNow = async () => {
    if (!confirmComplete) return;
    try {
      await invoke("complete_transfer", { transferId: confirmComplete.id });
      setConfirmComplete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not complete transfer.");
      setConfirmComplete(null);
    }
  };

  const deleteNow = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_transfer", { transferId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete transfer.");
      setConfirmDelete(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCategory || p.category_id === filterCategory;
    const matchBrand = !filterBrand || p.brand_id === filterBrand;
    return matchSearch && matchCat && matchBrand;
  });

  const getStatusColor = (s) => ({
    completed: "bg-green-800 text-white",
    pending: "bg-orange-600 text-white",
    in_progress: "bg-blue-950 text-white",
    cancelled: "bg-red-800 text-white",
  }[s] || "bg-gray-700 text-white");

  const getStatusIcon = (s) => {
    if (s === "completed") return <CheckCircle size={12} />;
    if (s === "pending") return <Clock size={12} />;
    if (s === "in_progress") return <Truck size={12} />;
    if (s === "cancelled") return <XCircle size={12} />;
    return null;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Stock Transfers</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Move stock between warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/warehouses/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <ArrowLeft size={16} /> Warehouses
            </button>
          </Link>
          <button onClick={() => setShowForm(true)} disabled={warehouses.length < 2}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm disabled:opacity-50">
            <Plus size={16} /> New Transfer
          </button>
        </div>
      </div>

      {warehouses.length < 2 && (
        <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-500 flex items-start gap-2">
          <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-800 font-bold">
            You need at least 2 warehouses to create a transfer. Add another one in Warehouses.
          </p>
        </div>
      )}

      {(error || success) && (
        <div className={`mb-4 p-3 border-l-4 flex items-start gap-2 ${
          error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-800"
        }`}>
          {error ? <AlertCircle size={16} className="text-red-600 mt-0.5" /> : <CheckCircle size={16} className="text-green-800 mt-0.5" />}
          <p className={`text-xs font-bold ${error ? "text-red-800" : "text-green-800"}`}>{error || success}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Transfers" value={transfers.length} color="border-blue-950" />
        <Stat label="Pending" value={transfers.filter(t => t.status === "pending").length} color="border-orange-600" />
        <Stat label="Completed" value={transfers.filter(t => t.status === "completed").length} color="border-green-800" />
        <Stat label="Cancelled" value={transfers.filter(t => t.status === "cancelled").length} color="border-red-800" />
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[950px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider w-10"></th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">From</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider"></th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">To</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="9" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && transfers.length === 0 && (
              <tr><td colSpan="9" className="py-8 text-center text-gray-500 font-medium">
                No transfers yet.
              </td></tr>
            )}
            {!loading && transfers.map(t => (
              <>
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    {t.items.length > 0 && (
                      <button onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                        className="text-blue-950 hover:text-orange-500">
                        {expanded === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-950">{t.from_warehouse_name}</td>
                  <td className="py-3 px-4 text-center"><ArrowRight size={14} className="text-gray-400 inline" /></td>
                  <td className="py-3 px-4 font-bold text-blue-950">{t.to_warehouse_name}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{t.item_count} item{t.item_count === 1 ? "" : "s"}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{t.total_quantity}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(t.status)}`}>
                      {getStatusIcon(t.status)} {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                    {t.created_at?.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {t.status === "pending" && (
                        <button onClick={() => setConfirmComplete(t)}
                          className="text-green-800 hover:text-green-900 transition-colors" title="Complete">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {t.status !== "completed" && (
                        <button onClick={() => setConfirmDelete(t)}
                          className="text-red-800 hover:text-red-900 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expanded === t.id && (
                  <tr className="bg-gray-50">
                    <td colSpan="9" className="px-4 py-3">
                      <div className="border-l-4 border-blue-950 pl-3">
                        <p className="text-[10px] font-bold text-blue-950 uppercase tracking-wider mb-2">
                          Items in this transfer
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-600">
                              <th className="text-left py-1 font-bold">Product</th>
                              <th className="text-left py-1 font-bold">SKU</th>
                              <th className="text-center py-1 font-bold">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {t.items.map(i => (
                              <tr key={i.id} className="border-t border-gray-200">
                                <td className="py-1.5 font-bold text-blue-950">{i.product_name}</td>
                                <td className="py-1.5 text-gray-600">{i.product_sku}</td>
                                <td className="py-1.5 text-center font-bold text-blue-950">{i.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {t.notes && (
                          <p className="text-[10px] text-gray-500 mt-2">Notes: {t.notes}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-3xl my-6">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">New Stock Transfer</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">From Warehouse *</label>
                  <select value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">Select source</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">To Warehouse *</label>
                  <select value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">Select destination</option>
                    {warehouses.filter(w => w.id !== form.from).map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Notes</label>
                <input type="text" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Optional" />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Add Products</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 sm:col-span-1">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Search name or SKU..."
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-sm font-medium text-blue-950 outline-none" />
                  </div>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none bg-white">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
                    className="border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none bg-white">
                    <option value="">All Brands</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="max-h-48 overflow-y-auto border-2 border-blue-950/10 mb-3">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-xs font-medium">
                      No products match your filters.
                    </div>
                  ) : (
                    filteredProducts.slice(0, 30).map(p => (
                      <button key={p.id} type="button" onClick={() => addItem(p)}
                        disabled={form.items.some(i => i.product_id === p.id)}
                        className="w-full text-left p-2 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between disabled:opacity-40">
                        <div>
                          <p className="font-bold text-blue-950 text-xs">
                            {p.name}
                            {p.brand_name && <span className="ml-2 text-[10px] font-medium text-gray-500">· {p.brand_name}</span>}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {p.sku} · {p.category_name || "—"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-950">Stock: {p.total_stock}</span>
                      </button>
                    ))
                  )}
                </div>

                {form.items.length > 0 && (
                  <table className="w-full text-sm border-2 border-blue-950/10">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                        <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Available</th>
                        <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
                        <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map(i => (
                        <tr key={i.product_id} className="border-t border-gray-100">
                          <td className="py-2 px-3 font-bold text-blue-950 text-xs">{i.product_name}</td>
                          <td className="py-2 px-3 text-center text-gray-600 text-xs">{i.available}</td>
                          <td className="py-2 px-3 text-center">
                            <input type="number" min="1" value={i.quantity}
                              onChange={(e) => updateItemQty(i.product_id, e.target.value)}
                              className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button type="button" onClick={() => removeItem(i.product_id)}
                              className="text-red-800 hover:text-red-900">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10">
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs sm:text-sm">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" disabled={saving || form.items.length === 0}
                  className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Create Transfer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmComplete}
        title="Complete Transfer"
        message={`Confirm that stock has physically arrived at "${confirmComplete?.to_warehouse_name}"? This will move stock between warehouses.`}
        confirmLabel="Complete"
        danger={false}
        onConfirm={completeNow}
        onCancel={() => setConfirmComplete(null)}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Transfer"
        message="Delete this pending transfer? No stock has moved yet."
        confirmLabel="Delete"
        onConfirm={deleteNow}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl sm:text-2xl font-bold text-blue-950">{value}</p>
  </div>
);

export default StockTransfers;
