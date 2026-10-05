import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Search, Filter, Eye, Edit, Trash2, Plus, Package,
  AlertTriangle, PackageX, Loader2, AlertCircle
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_products", {
        search: searchTerm || null,
        categoryId: categoryFilter || null,
        onlyActive: false,
      });
      setProducts(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setCategories(await invoke("list_categories"));
      } catch {}
    })();
  }, []);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [searchTerm, categoryFilter]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_product", { productId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete product.");
      setConfirmDelete(null);
    }
  };

  const getStatus = (p) => {
    if (p.total_stock <= 0) return { label: "Out of Stock", cls: "bg-red-800 text-white" };
    if (p.total_stock <= p.reorder_level) return { label: "Low Stock", cls: "bg-orange-600 text-white" };
    return { label: "In Stock", cls: "bg-green-800 text-white" };
  };

  const total = products.length;
  const inStock = products.filter(p => p.total_stock > p.reorder_level).length;
  const lowStock = products.filter(p => p.total_stock > 0 && p.total_stock <= p.reorder_level).length;
  const outStock = products.filter(p => p.total_stock <= 0).length;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">All Products</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Complete inventory list with stock status</p>
        </div>
        <Link to="/inventory/add-product">
          <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
            <Plus size={16} /> Add Product
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Products" value={total} color="border-blue-950" />
        <Stat label="In Stock" value={inStock} color="border-green-800" />
        <Stat label="Low Stock" value={lowStock} color="border-orange-600" />
        <Stat label="Out of Stock" value={outStock} color="border-red-800" />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search by name, SKU, or barcode..."
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Cost</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Stock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Locations</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="10" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading products…
              </td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan="10" className="py-8 text-center text-gray-500 font-medium">
                No products yet. Click "Add Product" to start.
              </td></tr>
            )}
            {!loading && products.map((p) => {
              const st = getStatus(p);
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{p.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p.category_name || "—"}</td>
                  <td className="py-3 px-4 text-right text-gray-600 font-medium">KSH {p.cost_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.sell_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{p.total_stock}</td>
                  <td className="py-3 px-4">
                    {p.warehouses && p.warehouses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.warehouses.map(w => (
                          <span key={w.warehouse_id} className="text-[10px] font-bold bg-blue-950/10 text-blue-950 px-1.5 py-0.5">
                            {w.warehouse_name}: {w.quantity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 font-medium">{p.reorder_level}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/inventory/edit-product/${p.id}`}
                        className="text-orange-600 hover:text-orange-800 transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => setConfirmDelete(p)}
                        className="text-red-800 hover:text-red-900 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal open={!!confirmDelete} title="Delete Product"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl sm:text-2xl font-bold text-blue-950">{value}</p>
  </div>
);

export default Products;
