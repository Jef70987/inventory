import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Warehouse as WarehouseIcon, Plus, MapPin, Users, Package,
  Building2, Phone, Edit, Trash2, Star, Loader2, AlertCircle,
  CheckCircle, X, Save
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const emptyForm = {
    name: "", location: "", manager: "", phone: "", email: "",
    capacity: "", status: "active", is_default: false,
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      setWarehouses(await invoke("list_warehouses"));
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({
      name: w.name,
      location: w.location || "",
      manager: w.manager || "",
      phone: w.phone || "",
      email: w.email || "",
      capacity: w.capacity || "",
      status: w.status,
      is_default: w.is_default,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Warehouse name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await invoke("update_warehouse", {
          warehouseId: editing.id,
          name: form.name.trim(),
          location: form.location.trim() || null,
          manager: form.manager.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          capacity: form.capacity.trim() || null,
          status: form.status,
        });
        if (form.is_default && !editing.is_default) {
          await invoke("set_default_warehouse", { warehouseId: editing.id });
        }
        setSuccess("Warehouse updated.");
      } else {
        await invoke("create_warehouse", {
          name: form.name.trim(),
          location: form.location.trim() || null,
          manager: form.manager.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          capacity: form.capacity.trim() || null,
          isDefault: form.is_default,
        });
        setSuccess("Warehouse created.");
      }
      setShowForm(false);
      await load();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save warehouse.");
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (w) => {
    try {
      await invoke("set_default_warehouse", { warehouseId: w.id });
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not set default.");
    }
  };

  const confirmDel = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_warehouse", { warehouseId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete warehouse.");
      setConfirmDelete(null);
    }
  };

  const totalItems = warehouses.reduce((s, w) => s + w.total_stock, 0);
  const activeCount = warehouses.filter(w => w.status === "active").length;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Warehouses</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">
            Manage your storage locations. One shop = one warehouse works fine.
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm w-fit">
          <Plus size={16} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Warehouses" value={warehouses.length} color="border-blue-950" />
        <Stat label="Active" value={activeCount} color="border-green-800" />
        <Stat label="Total Items" value={totalItems} color="border-orange-600" />
        <Stat label="Locations" value={warehouses.length} color="border-blue-950" />
      </div>

      {(error || success) && (
        <div className={`mb-4 p-3 border-l-4 flex items-start gap-2 ${
          error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-800"
        }`}>
          {error ? <AlertCircle size={16} className="text-red-600 mt-0.5" /> : <CheckCircle size={16} className="text-green-800 mt-0.5" />}
          <p className={`text-xs font-bold ${error ? "text-red-800" : "text-green-800"}`}>{error || success}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin inline text-blue-950" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="bg-white border-2 border-blue-950/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-950 p-3 border-2 border-white/20">
                      <WarehouseIcon size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-950 text-lg flex items-center gap-2">
                        {w.name}
                        {w.is_default && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <MapPin size={14} /> {w.location || "—"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold ${
                    w.status === "active" ? "bg-green-800 text-white"
                    : w.status === "maintenance" ? "bg-orange-600 text-white"
                    : "bg-red-800 text-white"
                  }`}>{w.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Manager</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Users size={14} /> {w.manager || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Items</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Package size={14} /> {w.total_stock} ({w.product_count} products)
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Capacity</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Building2 size={14} /> {w.capacity || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Phone</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Phone size={14} /> {w.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t-2 border-gray-100">
                  {!w.is_default && (
                    <button onClick={() => setDefault(w)}
                      className="text-blue-950 border-2 border-blue-950/20 px-3 py-1 text-xs font-bold hover:bg-blue-950 hover:text-white transition-colors flex items-center gap-1">
                      <Star size={14} /> Make Default
                    </button>
                  )}
                  <button onClick={() => openEdit(w)}
                    className="text-orange-600 border-2 border-orange-600/20 px-3 py-1 text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors flex items-center gap-1">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(w)}
                    className="text-red-800 border-2 border-red-800/20 px-3 py-1 text-xs font-bold hover:bg-red-800 hover:text-white transition-colors flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {warehouses.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 font-medium">
              No warehouses. Click "Add Warehouse" to create one.
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">
                {editing ? "Edit Warehouse" : "New Warehouse"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Name *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="e.g., Main Store, Shop Floor" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Location</label>
                <input type="text" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Address or description" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Manager</label>
                <input type="text" value={form.manager}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Capacity</label>
                <input type="text" value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="e.g., 5,000 sq ft" />
              </div>
              {editing && (
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_default" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 accent-orange-500" />
                <label htmlFor="is_default" className="text-sm font-bold text-blue-950">
                  Set as default warehouse
                </label>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10">
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs sm:text-sm">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> {editing ? "Update" : "Create"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Warehouse"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDel}
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

export default Warehouses;
