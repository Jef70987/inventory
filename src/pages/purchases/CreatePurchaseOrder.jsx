import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, Plus, Trash2, Search, Loader2, AlertCircle
} from "lucide-react";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({
    supplier_id: "", expected_date: "", notes: "", items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, p, c, b] = await Promise.all([
          invoke("list_suppliers", { search: null }),
          invoke("list_products", { search: null, categoryId: null, onlyActive: true }),
          invoke("list_categories"),
          invoke("list_brands"),
        ]);
        setSuppliers(s);
        setProducts(p);
        setCategories(c);
        setBrands(b);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load data.");
      }
    })();
  }, []);

  const addItem = (p) => {
    if (form.items.some(i => i.product_id === p.id)) return;
    setForm({
      ...form,
      items: [...form.items, {
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        quantity: 1,
        unit_cost: p.cost_price || 0,
      }],
    });
  };

  const updateItem = (pid, field, value) => {
    setForm({
      ...form,
      items: form.items.map(i =>
        i.product_id === pid ? { ...i, [field]: Number(value) || 0 } : i
      ),
    });
  };

  const removeItem = (pid) => setForm({ ...form, items: form.items.filter(i => i.product_id !== pid) });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.supplier_id) { setError("Select a supplier."); return; }
    if (form.items.length === 0) { setError("Add at least one product."); return; }
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await invoke("create_purchase_order", {
        supplierId: form.supplier_id,
        expectedDate: form.expected_date || null,
        notes: form.notes.trim() || null,
        userId: user?.id || null,
        items: form.items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
      });
      navigate("/purchases/orders");
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create PO.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCategory || p.category_id === filterCategory;
    const matchBrand = !filterBrand || p.brand_id === filterBrand;
    return matchSearch && matchCat && matchBrand;
  });

  const grandTotal = form.items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Create Purchase Order</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Generate a new purchase order</p>
        </div>
        <Link to="/purchases/orders">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Order Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Supplier *</label>
                  <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">Select Supplier</option>
                    {suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Expected Date</label>
                  <input type="date" value={form.expected_date}
                    onChange={(e) => setForm({ ...form, expected_date: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Notes</label>
                  <input type="text" value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Add Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Search products..."
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

              <div className="max-h-56 overflow-y-auto border-2 border-blue-950/10 mb-3">
                {filtered.length === 0 ? (
                  <p className="p-3 text-center text-gray-500 text-xs font-medium">No products match.</p>
                ) : filtered.slice(0, 40).map(p => (
                  <button key={p.id} type="button" onClick={() => addItem(p)}
                    disabled={form.items.some(i => i.product_id === p.id)}
                    className="w-full text-left p-2 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between disabled:opacity-40">
                    <div>
                      <p className="font-bold text-blue-950 text-xs">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.sku} · cost KSH {p.cost_price.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] text-gray-500">Stock: {p.total_stock}</span>
                  </button>
                ))}
              </div>

              {form.items.length > 0 && (
                <table className="w-full text-sm border-2 border-blue-950/10">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase">Product</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Qty</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Unit Cost</th>
                      <th className="text-right py-2 px-3 font-bold text-blue-950 text-xs uppercase">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map(i => (
                      <tr key={i.product_id} className="border-t border-gray-100">
                        <td className="py-2 px-3 font-bold text-blue-950 text-xs">{i.product_name}</td>
                        <td className="py-2 px-3 text-center">
                          <input type="number" min="1" value={i.quantity}
                            onChange={(e) => updateItem(i.product_id, "quantity", e.target.value)}
                            className="w-16 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input type="number" step="0.01" value={i.unit_cost}
                            onChange={(e) => updateItem(i.product_id, "unit_cost", e.target.value)}
                            className="w-24 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-950 text-xs">
                          KSH {(i.quantity * i.unit_cost).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
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
          </div>

          <div>
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm sticky top-4">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Summary</h2>
              <div className="flex justify-between text-sm font-bold text-blue-950 pt-2 pb-4 border-b-2 border-blue-950/10 mb-4">
                <span>Grand Total</span>
                <span>KSH {grandTotal.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Create Order</>}
              </button>
              <Link to="/purchases/orders">
                <button type="button"
                  className="w-full mt-3 bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;
