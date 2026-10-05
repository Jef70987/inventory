import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, Barcode, AlertCircle, CheckCircle, Loader2
} from "lucide-react";

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", description: "",
    category_id: "", brand_id: "", unit_id: "",
    cost_price: 0, sell_price: 0, reorder_level: 0,
    shelf_location: "", weight_kg: "", dimensions: "",
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    (async () => {
      try {
        const [c, b, u] = await Promise.all([
          invoke("list_categories"),
          invoke("list_brands"),
          invoke("list_units"),
        ]);
        setCategories(c);
        setBrands(b);
        setUnits(u);

        if (isEdit) {
          const p = await invoke("get_product", { productId: id });
          setForm({
            name: p.name, sku: p.sku, barcode: p.barcode || "",
            description: p.description || "",
            category_id: p.category_id || "",
            brand_id: p.brand_id || "",
            unit_id: p.unit_id || "",
            cost_price: p.cost_price, sell_price: p.sell_price,
            reorder_level: p.reorder_level,
            shelf_location: p.shelf_location || "",
            weight_kg: p.weight_kg ?? "",
            dimensions: p.dimensions || "",
            is_active: p.is_active,
          });
        }
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateSku = () => {
    const prefix = (form.name || "PRD").slice(0, 3).toUpperCase().replace(/\s/g, "");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    setForm({ ...form, sku: `${prefix}-${rand}` });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim() || !form.sku.trim()) {
      setError("Name and SKU are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        barcode: form.barcode.trim() || null,
        description: form.description.trim() || null,
        categoryId: form.category_id || null,
        brandId: form.brand_id || null,
        unitId: form.unit_id || null,
        costPrice: Number(form.cost_price) || 0,
        sellPrice: Number(form.sell_price) || 0,
        reorderLevel: Number(form.reorder_level) || 0,
        shelfLocation: form.shelf_location.trim() || null,
        weightKg: form.weight_kg === "" ? null : Number(form.weight_kg),
        dimensions: form.dimensions.trim() || null,
      };

      if (isEdit) {
        await invoke("update_product", {
          productId: id,
          ...payload,
          isActive: form.is_active,
        });
        setSuccess("Product updated.");
      } else {
        await invoke("create_product", payload);
        setSuccess("Product created.");
      }
      setTimeout(() => navigate("/inventory/products"), 1200);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">
            {isEdit ? "Update product details" : "Create a new product entry in the inventory"}
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

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Product Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., Simba Cement 50kg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">SKU *</label>
                  <div className="flex">
                    <input type="text" name="sku" value={form.sku} onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                      placeholder="e.g., CEM-0001" />
                    <button type="button" onClick={generateSku}
                      className="bg-blue-950 text-white px-3 border-2 border-blue-950 hover:bg-blue-900 transition-colors" title="Generate SKU">
                      <Barcode size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Barcode</label>
                  <input type="text" name="barcode" value={form.barcode} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="Scan or type barcode" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Category</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Brand</label>
                  <select name="brand_id" value={form.brand_id} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">None</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Unit of Measure</label>
                  <select name="unit_id" value={form.unit_id} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                    <option value="">None</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Cost Price (KSH)</label>
                  <input type="number" step="0.01" name="cost_price" value={form.cost_price} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Selling Price (KSH)</label>
                  <input type="number" step="0.01" name="sell_price" value={form.sell_price} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reorder Level</label>
                  <input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0" />
                </div>
              </div>
              {Number(form.sell_price) > 0 && Number(form.cost_price) > 0 && (
                <p className="mt-3 text-xs font-bold text-green-800">
                  Margin: {(((Number(form.sell_price) - Number(form.cost_price)) / Number(form.sell_price)) * 100).toFixed(1)}%
                </p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Description</h2>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Product description..."></textarea>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Additional Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Shelf Location</label>
                  <input type="text" name="shelf_location" value={form.shelf_location} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., Aisle 3, Shelf B" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Weight (kg)</label>
                  <input type="number" step="0.01" name="weight_kg" value={form.weight_kg} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Dimensions</label>
                  <input type="text" name="dimensions" value={form.dimensions} onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., 10 x 5 x 3 cm" />
                </div>
                {isEdit && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <input type="checkbox" id="active" checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="active" className="text-sm font-bold text-blue-950">Active</label>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> {isEdit ? "Update Product" : "Save Product"}</>}
              </button>
              <Link to="/inventory/products">
                <button type="button"
                  className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
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

export default AddProduct;
