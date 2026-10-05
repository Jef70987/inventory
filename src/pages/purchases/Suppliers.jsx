import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Truck, Plus, Search, Eye, Edit, Trash2, Phone, Mail, MapPin,
  Star, Loader2, AlertCircle, CheckCircle, Save, X
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const emptyForm = {
    name: "", contact_name: "", phone: "", email: "",
    address: "", payment_terms: "", rating: 0, is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_suppliers", { search: searchTerm || null });
      setSuppliers(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSuppliers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => loadSuppliers(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      contact_name: s.contact_name || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      payment_terms: s.payment_terms || "",
      rating: s.rating || 0,
      is_active: s.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await invoke("update_supplier", {
          supplierId: editing.id,
          name: form.name.trim(),
          contactName: form.contact_name.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          paymentTerms: form.payment_terms.trim() || null,
          rating: Number(form.rating) || 0,
          isActive: form.is_active,
        });
        setSuccess("Supplier updated.");
      } else {
        await invoke("create_supplier", {
          name: form.name.trim(),
          contactName: form.contact_name.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          paymentTerms: form.payment_terms.trim() || null,
          rating: Number(form.rating) || 0,
        });
        setSuccess("Supplier created.");
      }
      setShowForm(false);
      await loadSuppliers();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_supplier", { supplierId: confirmDelete.id });
      setConfirmDelete(null);
      await loadSuppliers();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete supplier.");
      setConfirmDelete(null);
    }
  };

  const totalSuppliers = suppliers.length;
  const activeCount = suppliers.filter(s => s.is_active).length;
  const totalSpend = suppliers.reduce((s, x) => s + x.total_spend, 0);
  const avgRating = suppliers.length > 0
    ? (suppliers.reduce((s, x) => s + x.rating, 0) / suppliers.length).toFixed(1)
    : "0.0";

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Suppliers</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage all your suppliers and vendors</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm w-fit">
          <Plus size={16} />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat title="Total" value={totalSuppliers} color="border-blue-950" />
        <Stat title="Active" value={activeCount} color="border-green-800" />
        <Stat title="Total Spend" value={`KSH ${totalSpend.toFixed(0)}`} color="border-orange-600" />
        <Stat title="Avg Rating" value={avgRating} color="border-blue-950" />
      </div>

      {(error || success) && (
        <div className={`mb-4 p-3 border-l-4 flex items-start gap-2 ${
          error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-800"
        }`}>
          {error ? <AlertCircle size={16} className="text-red-600 mt-0.5" /> : <CheckCircle size={16} className="text-green-800 mt-0.5" />}
          <p className={`text-xs font-bold ${error ? "text-red-800" : "text-green-800"}`}>
            {error || success}
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
        <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-2xl my-6">
          <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
            <h2 className="text-lg font-bold text-blue-950">
              {editing ? "Edit Supplier" : "New Supplier"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Name *</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="e.g., ABC Supplies" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Contact Person</label>
              <input type="text" value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="e.g., John Smith" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="+254 7XX XXX XXX" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="info@supplier.com" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
              <input type="text" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Street, City" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Payment Terms</label>
              <input type="text" value={form.payment_terms}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="e.g., Net 30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Rating (0–5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="0.0" />
            </div>
            {editing && (
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-orange-500" />
                <label htmlFor="active" className="text-sm font-bold text-blue-950">Active</label>
              </div>
            )}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10 mt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
              <button type="submit" disabled={saving}
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> {editing ? "Update" : "Create"}</>}
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search suppliers..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[850px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Phone</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Email</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Orders</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Spend</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Rating</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500 font-medium">
                  <Loader2 size={20} className="animate-spin inline mr-2" /> Loading suppliers…
                </td>
              </tr>
            )}
            {!loading && suppliers.length === 0 && (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500 font-medium">
                  No suppliers yet. Click "Add Supplier" to start.
                </td>
              </tr>
            )}
            {!loading && suppliers.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-blue-950">{s.name}</p>
                  {s.payment_terms && (
                    <p className="text-[10px] text-gray-500 font-medium">Terms: {s.payment_terms}</p>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700 font-medium">{s.contact_name || "—"}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  <span className="flex items-center gap-1"><Phone size={12} /> {s.phone || "—"}</span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  <span className="flex items-center gap-1"><Mail size={12} /> {s.email || "—"}</span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{s.total_orders}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {s.total_spend.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-xs font-bold text-orange-600 flex items-center justify-center gap-0.5">
                    <Star size={12} className="fill-orange-600" /> {s.rating.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${
                    s.is_active ? "bg-green-800 text-white" : "bg-red-800 text-white"
                  }`}>
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)}
                      className="text-orange-600 hover:text-orange-800 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete(s)}
                      className="text-red-800 hover:text-red-900 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Supplier"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

const Stat = ({ title, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{title}</p>
    <p className="text-xl sm:text-2xl font-bold text-blue-950">{value}</p>
  </div>
);

export default Suppliers;
