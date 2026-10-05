import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Users, Search, Plus, Eye, Edit, Trash2, Mail, Phone,
  MapPin, DollarSign, ShoppingCart, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const AllCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_customers", { search: searchTerm || null });
      setCustomers(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_customer", { customerId: confirmDelete.id });
      setConfirmDelete(null);
      await loadCustomers();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete customer.");
      setConfirmDelete(null);
    }
  };

  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === "active").length;
  const totalOrders = customers.reduce((s, c) => s + c.total_orders, 0);
  const totalRevenue = customers.reduce((s, c) => s + c.total_purchases, 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">All Customers</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage your customer base and purchase history</p>
        </div>
        <Link to="/customers/add">
          <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Total Customers" value={totalCustomers} icon={Users} color="border-blue-950" bg="bg-blue-950" />
        <StatCard title="Active" value={activeCount} icon={CheckCircle} color="border-green-800" bg="bg-green-800" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} color="border-orange-600" bg="bg-orange-600" />
        <StatCard title="Total Revenue" value={`KSH ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="border-blue-950" bg="bg-blue-950" />
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by name, email, or phone..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Address</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Purchases</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Orders</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                  <Loader2 size={20} className="animate-spin inline mr-2" /> Loading customers…
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                  No customers yet. Click "Add Customer" to start.
                </td>
              </tr>
            )}
            {!loading && customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-bold text-blue-950">{c.name}</p>
                    {c.groups.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {c.groups.map((g, i) => (
                          <span key={i} className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Mail size={12} /> {c.email || "—"}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Phone size={12} /> {c.phone || "—"}
                  </p>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {c.address || c.city || "—"}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-blue-950">KSH {c.total_purchases.toFixed(2)}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{c.total_orders}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${
                    c.status === "active" ? "bg-green-800 text-white" : "bg-red-800 text-white"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/customers/${c.id}/purchases`}
                      className="text-blue-950 hover:text-blue-700 transition-colors" title="Purchase history">
                      <Eye size={16} />
                    </Link>
                    <button onClick={() => setConfirmDelete(c)}
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
        title="Delete Customer"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-blue-950">{value}</p>
    </div>
    <div className={`${bg} p-2 border-2 border-white/20`}>
      <Icon size={20} color="white" />
    </div>
  </div>
);

export default AllCustomers;
