import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Tags, Award, Ruler, Plus, Trash2, Loader2, AlertCircle,
  CheckCircle, X, Save
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const Lookups = () => {
  const [tab, setTab] = useState("categories");

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 pb-4 border-b-2 border-blue-950/20">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Lookups</h1>
        <p className="text-gray-600 font-medium text-xs sm:text-sm">
          Manage categories, brands, and units of measure
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b-2 border-blue-950/10">
        <TabButton active={tab === "categories"} onClick={() => setTab("categories")} icon={Tags} label="Categories" />
        <TabButton active={tab === "brands"} onClick={() => setTab("brands")} icon={Award} label="Brands" />
        <TabButton active={tab === "units"} onClick={() => setTab("units")} icon={Ruler} label="Units" />
      </div>

      {tab === "categories" && <CategoriesTab />}
      {tab === "brands" && <BrandsTab />}
      {tab === "units" && <UnitsTab />}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-colors border-b-2 -mb-0.5 ${
      active
        ? "border-orange-500 text-blue-950"
        : "border-transparent text-gray-500 hover:text-blue-950"
    }`}>
    <Icon size={16} />
    {label}
  </button>
);

// ---------- Categories ----------
const CategoriesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", parent_id: "", description: "" });

  const load = async () => {
    try {
      setItems(await invoke("list_categories"));
    } catch (e) {
      setError(typeof e === "string" ? e : "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name required"); return; }
    setSaving(true);
    try {
      await invoke("create_category", {
        name: form.name.trim(),
        parentId: form.parent_id || null,
        description: form.description.trim() || null,
      });
      setForm({ name: "", parent_id: "", description: "" });
      setShowForm(false);
      setSuccess("Category created.");
      await load();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDel = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_category", { categoryId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Delete failed");
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-medium">
          {items.length} categor{items.length === 1 ? "y" : "ies"}
        </p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
          <Plus size={16} /> New Category
        </button>
      </div>

      <Messages error={error} success={success} />

      <Table
        loading={loading}
        rows={items}
        empty="No categories yet."
        columns={["Name", "Description", "Products", "Actions"]}
        render={(c) => (
          <>
            <td className="py-3 px-4 font-bold text-blue-950">{c.name}</td>
            <td className="py-3 px-4 text-gray-600 text-sm">{c.description || "—"}</td>
            <td className="py-3 px-4 text-center font-bold text-blue-950">{c.product_count}</td>
            <td className="py-3 px-4">
              <button onClick={() => setConfirmDelete(c)}
                className="text-red-800 hover:text-red-900 transition-colors">
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )}
      />

      {showForm && (
        <FormModal title="New Category" onClose={() => setShowForm(false)}
          onSubmit={submit} saving={saving}>
          <Field label="Name *" value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g., Power Tools" />
          <Field label="Parent (optional)" value={form.parent_id}
            onChange={(v) => setForm({ ...form, parent_id: v })}
            placeholder="Leave empty for top level" select
            options={items.map(c => ({ value: c.id, label: c.name }))} />
          <Field label="Description" value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Optional" />
        </FormModal>
      )}

      <ConfirmModal open={!!confirmDelete} title="Delete Category"
        message={`Delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete" onConfirm={confirmDel}
        onCancel={() => setConfirmDelete(null)} />
    </>
  );
};

// ---------- Brands ----------
const BrandsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = async () => {
    try {
      setItems(await invoke("list_brands"));
    } catch (e) {
      setError(typeof e === "string" ? e : "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name required"); return; }
    setSaving(true);
    try {
      await invoke("create_brand", {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      setForm({ name: "", description: "" });
      setShowForm(false);
      setSuccess("Brand created.");
      await load();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDel = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_brand", { brandId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Delete failed");
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-medium">
          {items.length} brand{items.length === 1 ? "" : "s"}
        </p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
          <Plus size={16} /> New Brand
        </button>
      </div>

      <Messages error={error} success={success} />

      <Table
        loading={loading}
        rows={items}
        empty="No brands yet."
        columns={["Name", "Description", "Products", "Actions"]}
        render={(b) => (
          <>
            <td className="py-3 px-4 font-bold text-blue-950">{b.name}</td>
            <td className="py-3 px-4 text-gray-600 text-sm">{b.description || "—"}</td>
            <td className="py-3 px-4 text-center font-bold text-blue-950">{b.product_count}</td>
            <td className="py-3 px-4">
              <button onClick={() => setConfirmDelete(b)}
                className="text-red-800 hover:text-red-900 transition-colors">
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )}
      />

      {showForm && (
        <FormModal title="New Brand" onClose={() => setShowForm(false)}
          onSubmit={submit} saving={saving}>
          <Field label="Name *" value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g., Bosch" />
          <Field label="Description" value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Optional" />
        </FormModal>
      )}

      <ConfirmModal open={!!confirmDelete} title="Delete Brand"
        message={`Delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete" onConfirm={confirmDel}
        onCancel={() => setConfirmDelete(null)} />
    </>
  );
};

// ---------- Units ----------
const UnitsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ code: "", name: "" });

  const load = async () => {
    try {
      setItems(await invoke("list_units"));
    } catch (e) {
      setError(typeof e === "string" ? e : "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim() || !form.name.trim()) { setError("Code and name required"); return; }
    setSaving(true);
    try {
      await invoke("create_unit", {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
      });
      setForm({ code: "", name: "" });
      setShowForm(false);
      setSuccess("Unit created.");
      await load();
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDel = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_unit", { unitId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Delete failed");
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-medium">
          {items.length} unit{items.length === 1 ? "" : "s"}
        </p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
          <Plus size={16} /> New Unit
        </button>
      </div>

      <Messages error={error} success={success} />

      <Table
        loading={loading}
        rows={items}
        empty="No units yet."
        columns={["Code", "Name", "Products", "Actions"]}
        render={(u) => (
          <>
            <td className="py-3 px-4 font-bold text-blue-950">{u.code}</td>
            <td className="py-3 px-4 text-gray-700 font-medium">{u.name}</td>
            <td className="py-3 px-4 text-center font-bold text-blue-950">{u.product_count}</td>
            <td className="py-3 px-4">
              <button onClick={() => setConfirmDelete(u)}
                className="text-red-800 hover:text-red-900 transition-colors">
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )}
      />

      {showForm && (
        <FormModal title="New Unit" onClose={() => setShowForm(false)}
          onSubmit={submit} saving={saving}>
          <Field label="Code *" value={form.code}
            onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
            placeholder="e.g., PC, KG, L" />
          <Field label="Name *" value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g., Piece, Kilogram, Litre" />
        </FormModal>
      )}

      <ConfirmModal open={!!confirmDelete} title="Delete Unit"
        message={`Delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete" onConfirm={confirmDel}
        onCancel={() => setConfirmDelete(null)} />
    </>
  );
};

// ---------- Shared bits ----------
const Messages = ({ error, success }) => (
  <>
    {error && (
      <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
        <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-red-800 font-bold">{error}</p>
      </div>
    )}
    {success && (
      <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
        <CheckCircle size={16} className="text-green-800 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-green-800 font-bold">{success}</p>
      </div>
    )}
  </>
);

const Table = ({ loading, rows, empty, columns, render }) => (
  <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
    <table className="w-full text-sm min-w-[500px]">
      <thead>
        <tr className="border-b-2 border-blue-950/10 bg-gray-50">
          {columns.map(c => (
            <th key={c} className={`py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider ${
              c === "Actions" ? "text-left" : c === "Products" ? "text-center" : "text-left"
            }`}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading && (
          <tr><td colSpan={columns.length} className="py-8 text-center text-gray-500 font-medium">
            <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
          </td></tr>
        )}
        {!loading && rows.length === 0 && (
          <tr><td colSpan={columns.length} className="py-8 text-center text-gray-500 font-medium">{empty}</td></tr>
        )}
        {!loading && rows.map(r => (
          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            {render(r)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FormModal = ({ title, onClose, onSubmit, saving, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
    <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-lg my-6">
      <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
        <h2 className="text-lg font-bold text-blue-950">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {children}
        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10">
          <button type="button" onClick={onClose}
            className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs sm:text-sm">
            <X size={16} /> Cancel
          </button>
          <button type="submit" disabled={saving}
            className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save</>}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, select, options }) => (
  <div>
    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">{label}</label>
    {select ? (
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
        <option value="">None</option>
        {(options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
    )}
  </div>
);

export default Lookups;
