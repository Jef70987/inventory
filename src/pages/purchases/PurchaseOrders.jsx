import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Plus, Search, Eye, Trash2, CheckCircle, Clock, XCircle, Truck,
  Loader2, AlertCircle, X, Save
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_purchase_orders", { search: searchTerm || null });
      setOrders(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const deleteNow = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_purchase_order", { poId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete PO.");
      setConfirmDelete(null);
    }
  };

  const getStatusColor = (s) => ({
    received: "bg-green-800 text-white",
    pending: "bg-orange-600 text-white",
    shipped: "bg-blue-950 text-white",
    approved: "bg-cyan-800 text-white",
    cancelled: "bg-red-800 text-white",
  }[s] || "bg-gray-700 text-white");

  const getStatusIcon = (s) => {
    if (s === "received") return <CheckCircle size={12} />;
    if (s === "pending") return <Clock size={12} />;
    if (s === "shipped") return <Truck size={12} />;
    if (s === "cancelled") return <XCircle size={12} />;
    return null;
  };

  const totalOrders = orders.length;
  const received = orders.filter(o => o.status === "received").length;
  const pending = orders.filter(o => o.status === "pending").length;
  const totalValue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Purchase Orders</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage all supplier purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/purchases/receive">
            <button className="flex items-center gap-2 bg-orange-600 text-white px-3 py-2 font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600 text-xs sm:text-sm">
              <Truck size={16} /> Receive
            </button>
          </Link>
          <Link to="/purchases/create">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
              <Plus size={16} /> Create PO
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Orders" value={totalOrders} color="border-blue-950" />
        <Stat label="Received" value={received} color="border-green-800" />
        <Stat label="Pending" value={pending} color="border-orange-600" />
        <Stat label="Total Value" value={`KSH ${totalValue.toFixed(0)}`} color="border-blue-950" />
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search PO number or supplier..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">PO #</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Date</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Items</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Expected</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                No purchase orders yet.
              </td></tr>
            )}
            {!loading && orders.map(o => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{o.po_number}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{o.supplier_name || "—"}</td>
                <td className="py-3 px-4 text-gray-600">{o.order_date}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{o.item_count}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {o.total.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(o.status)}`}>
                    {getStatusIcon(o.status)} {o.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{o.expected_date || "—"}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(o)} className="text-blue-950 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                    {o.status !== "received" && (
                      <button onClick={() => setConfirmDelete(o)} className="text-red-800 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6">
          <div className="bg-white shadow-2xl w-full max-w-lg border-t-4 border-orange-500">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">PO Details</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-950 p-3 mb-4 text-center">
                <p className="text-xs text-orange-200 font-bold uppercase">PO Number</p>
                <p className="text-lg font-bold text-white">{detail.po_number}</p>
              </div>
              <div className="text-xs space-y-1 mb-3">
                <Row label="Supplier" value={detail.supplier_name} />
                <Row label="Order Date" value={detail.order_date} />
                <Row label="Expected" value={detail.expected_date} />
                <Row label="Status" value={detail.status} />
                {detail.notes && <Row label="Notes" value={detail.notes} />}
              </div>
              <div className="border-t-2 border-dashed border-gray-300 py-3">
                <p className="text-[10px] font-bold text-blue-950 uppercase mb-2">Items</p>
                {detail.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-blue-950">{it.product_name}</p>
                      <p className="text-[10px] text-gray-500">
                        {it.quantity} × {it.unit_cost.toFixed(2)} · received: {it.received_qty}
                      </p>
                    </div>
                    <span className="font-bold text-blue-950">KSH {it.line_total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold border-t-2 border-dashed border-gray-300 pt-3">
                <span className="text-blue-950">Total</span>
                <span className="text-blue-950">KSH {detail.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmDelete} title="Delete Purchase Order"
        message={`Delete ${confirmDelete?.po_number}? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={deleteNow}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-blue-950">{value}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600 font-bold">{label}</span>
    <span className="font-bold text-blue-950 capitalize">{value || "—"}</span>
  </div>
);

export default PurchaseOrders;
