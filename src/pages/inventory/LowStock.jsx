import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, AlertTriangle, Package, Loader2, ShoppingCart } from "lucide-react";

const LowStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const products = await invoke("list_products", {
          search: null, categoryId: null, onlyActive: true,
        });
        // Low stock = stock > 0 AND stock <= reorder_level
        setItems(products.filter(p => p.total_stock > 0 && p.total_stock <= p.reorder_level));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getPriority = (stock, reorder) => {
    const ratio = stock / reorder;
    if (ratio < 0.3) return { label: "Critical", cls: "bg-orange-600 text-white" };
    if (ratio < 0.5) return { label: "Low", cls: "bg-yellow-600 text-white" };
    return { label: "Warning", cls: "bg-yellow-500 text-white" };
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Low Stock Items</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Products below their reorder level</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} /> Back to Products
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat title="Low Stock Items" value={items.length} color="border-orange-600" />
        <Stat title="Critical" value={items.filter(i => i.total_stock / i.reorder_level < 0.3).length} color="border-red-800" />
        <Stat title="Needs Reorder" value={items.length} color="border-blue-950" />
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Stock</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                No low stock items. All good.
              </td></tr>
            )}
            {!loading && items.map((p) => {
              const pr = getPriority(p.total_stock, p.reorder_level);
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{p.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{p.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p.category_name || "—"}</td>
                  <td className="py-3 px-4 text-center font-bold text-orange-600">{p.total_stock}</td>
                  <td className="py-3 px-4 text-center text-gray-600 font-medium">{p.reorder_level}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${pr.cls}`}>{pr.label}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link to="/inventory/stock-adjustment"
                      className="bg-orange-600 text-white px-3 py-1 text-xs font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600 inline-flex items-center gap-1">
                      <ShoppingCart size={12} /> Restock
                    </Link>
                  </td>
                </tr>
              );
            })}
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

export default LowStock;
