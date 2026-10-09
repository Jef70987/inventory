import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, Plus, Trash2, Search, Loader2, AlertCircle, Printer
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    notes: "",
    discount_amount: 0,
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, p, cat, br] = await Promise.all([
          invoke("list_customers", { search: null }),
          invoke("list_products", { search: null, categoryId: null, onlyActive: true }),
          invoke("list_categories"),
          invoke("list_brands"),
        ]);
        setCustomers(c);
        setProducts(p);
        setCategories(cat);
        setBrands(br);
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
        description: p.name,
        quantity: 1,
        unit_price: p.sell_price,
      }],
    });
  };

  const addCustomLine = () => {
    setForm({
      ...form,
      items: [...form.items, {
        product_id: null,
        description: "",
        quantity: 1,
        unit_price: 0,
      }],
    });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: field === "description" ? value : (Number(value) || 0) };
    setForm({ ...form, items });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const disc = Number(form.discount_amount) || 0;
  const total = Math.max(0, subtotal - disc);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.customer_id) { setError("Select a customer."); return; }
    if (form.items.length === 0) { setError("Add at least one item."); return; }
    if (form.items.some(i => !i.description || i.quantity <= 0)) {
      setError("All items need a description and quantity.");
      return;
    }
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await invoke("create_invoice", {
        customerId: form.customer_id,
        issueDate: form.issue_date || null,
        dueDate: form.due_date || null,
        notes: form.notes.trim() || null,
        discountAmount: disc,
        userId: user?.id || null,
        items: form.items.map(i => ({
          product_id: i.product_id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      navigate("/invoices/all");
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => {
    const ms = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const mc = !filterCategory || p.category_id === filterCategory;
    const mb = !filterBrand || p.brand_id === filterBrand;
    return ms && mc && mb;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Create Invoice</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Generate a new invoice</p>
        </div>
        <Link to="/invoices/all">
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
              <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Customer *</label>
                  <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Issue Date</label>
                  <input type="date" value={form.issue_date}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Due Date</label>
                  <input type="date" value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-950">Items</h2>
                <button type="button" onClick={addCustomLine}
                  className="flex items-center gap-1 bg-white border-2 border-blue-950/20 text-blue-950 px-3 py-1 text-xs font-bold hover:bg-gray-50">
                  <Plus size={14} /> Custom Line
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Search products to add..."
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

              {searchTerm && (
                <div className="max-h-40 overflow-y-auto border-2 border-blue-950/10 mb-3">
                  {filtered.slice(0, 30).map(p => (
                    <button key={p.id} type="button" onClick={() => addItem(p)}
                      disabled={form.items.some(i => i.product_id === p.id)}
                      className="w-full text-left p-2 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between disabled:opacity-40">
                      <div>
                        <p className="font-bold text-blue-950 text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.sku} · KSH {p.sell_price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {form.items.length > 0 && (
                <table className="w-full text-sm border-2 border-blue-950/10">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase">Description</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Qty</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Unit Price</th>
                      <th className="text-right py-2 px-3 font-bold text-blue-950 text-xs uppercase">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-2 px-3">
                          <input type="text" value={it.description}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none text-xs" />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input type="number" min="1" value={it.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            className="w-16 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input type="number" step="0.01" value={it.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                            className="w-24 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-950 text-xs">
                          KSH {(it.quantity * it.unit_price).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <button type="button" onClick={() => removeItem(idx)}
                            className="text-red-800 hover:text-red-900"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>KSH {subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 mt-3">Discount (KSH)</label>
                  <input type="number" step="0.01" min="0" value={form.discount_amount}
                    onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-950 pt-2 border-t-2 border-blue-950/10 mt-2">
                  <span>Total</span><span>KSH {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Notes</h2>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows="3"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Optional notes..."></textarea>
            </div>

            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <button type="submit" disabled={saving}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Create Invoice</>}
              </button>
              <Link to="/invoices/all">
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

export default CreateInvoice;
