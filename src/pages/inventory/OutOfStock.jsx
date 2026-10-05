import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Truck, Loader2, ShoppingCart } from "lucide-react";

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const products = await invoke("list_products", {
          search: null, categoryId: null, onlyActive: true,
        });
        setItems(products.filter(p => p.total_stock <= 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Out of Stock Items</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Products currently unavailable</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} /> Back to Products
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat title="Out of Stock" value={items.length} color="border-red-800" />
        <Stat title="Categories Affected" value={new Set(items.map(i => i.category_name).filter(Boolean)).size} color="border-orange-600" />
        <Stat title="Urgent Action" value={items.length} color="border-blue-950" />
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                No out-of-stock items. All products have stock.
              </td></tr>
            )}
            {!loading && items.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                <td className="py-3 px-4 text-gray-600 font-medium text-xs">{p.sku}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{p.category_name || "—"}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-medium">{p.reorder_level}</td>
                <td className="py-3 px-4">
                  <Link to="/inventory/stock-adjustment"
                    className="bg-red-800 text-white px-3 py-1 text-xs font-bold hover:bg-red-900 transition-colors border-2 border-red-800 inline-flex items-center gap-1">
                    <Truck size={12} /> Restock Now
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({ title, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-bold text-blue-950">{value}</p>
  </div>
);

export default OutOfStock;
