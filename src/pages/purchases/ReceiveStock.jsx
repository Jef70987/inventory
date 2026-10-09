import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Truck, Loader2, AlertCircle, CheckCircle, Save, X, ClipboardList
} from "lucide-react";

const ReceiveStock = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [receiveQty, setReceiveQty] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [o, w] = await Promise.all([
          invoke("list_purchase_orders", { search: null }),
          invoke("list_warehouses"),
        ]);
        // Only show orders that can still be received
        setOrders(o.filter(x => x.status !== "received" && x.status !== "cancelled"));
        setWarehouses(w);
        const def = w.find(x => x.is_default);
        if (def) setWarehouseId(def.id);
        else if (w.length > 0) setWarehouseId(w[0].id);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickPO = (po) => {
    setSelectedPO(po);
    const init = {};
    po.items.forEach(it => {
      const remaining = it.quantity - it.received_qty;
      init[it.id] = remaining > 0 ? remaining : 0;
    });
    setReceiveQty(init);
    setError("");
  };

  const setQty = (itemId, val) => {
    setReceiveQty({ ...receiveQty, [itemId]: Number(val) || 0 });
  };

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!warehouseId) { setError("Select a warehouse."); return; }

    const items = Object.entries(receiveQty)
      .filter(([_, q]) => q > 0)
      .map(([item_id, received_qty]) => ({ item_id, received_qty }));

    if (items.length === 0) { setError("Enter at least one received quantity."); return; }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await invoke("receive_purchase_order", {
        poId: selectedPO.id,
        warehouseId,
        userId: user?.id || null,
        receiveItems: items,
      });
      setSuccess(`Stock received for ${selectedPO.po_number}.`);
      setSelectedPO(null);
      setReceiveQty({});
      // Refresh list
      const o = await invoke("list_purchase_orders", { search: null });
      setOrders(o.filter(x => x.status !== "received" && x.status !== "cancelled"));
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not receive stock.");
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Receive Stock</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Process incoming stock from purchase orders</p>
        </div>
        <Link to="/purchases/orders">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm">
            <ArrowLeft size={16} /> Orders
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-800 mt-0.5" />
          <p className="text-xs text-green-800 font-bold">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-blue-950/10 shadow-sm">
            <div className="p-4 border-b-2 border-blue-950/10">
              <h2 className="font-bold text-blue-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <ClipboardList size={16} /> Pending POs
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="p-4 text-center text-gray-500 text-xs font-medium">
                No purchase orders awaiting receipt.
              </p>
            ) : (
              <ul>
                {orders.map(o => (
                  <li key={o.id}>
                    <button onClick={() => pickPO(o)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                        selectedPO?.id === o.id ? "bg-orange-500 text-white" : "hover:bg-gray-50"
                      }`}>
                      <p className={`font-bold text-sm ${selectedPO?.id === o.id ? "text-white" : "text-blue-950"}`}>
                        {o.po_number}
                      </p>
                      <p className={`text-[10px] ${selectedPO?.id === o.id ? "text-white/90" : "text-gray-500"}`}>
                        {o.supplier_name} · {o.item_count} items
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedPO ? (
            <div className="bg-white p-12 border-2 border-blue-950/10 shadow-sm text-center">
              <Truck size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">Select a purchase order to receive</p>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-blue-950">{selectedPO.po_number}</h2>
                  <p className="text-xs text-gray-600 font-medium">Supplier: {selectedPO.supplier_name}</p>
                </div>
                <button onClick={() => setSelectedPO(null)} className="text-red-800 hover:text-red-900">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Receiving Warehouse</label>
                <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}{w.is_default ? " (default)" : ""}</option>
                  ))}
                </select>
              </div>

              <table className="w-full text-sm border-2 border-blue-950/10">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase">Product</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Ordered</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Already</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Receiving</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map(it => {
                    const remaining = it.quantity - it.received_qty;
                    return (
                      <tr key={it.id} className="border-t border-gray-100">
                        <td className="py-2 px-3">
                          <p className="font-bold text-blue-950 text-xs">{it.product_name}</p>
                          <p className="text-[10px] text-gray-500">{it.product_sku}</p>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-blue-950 text-xs">{it.quantity}</td>
                        <td className="py-2 px-3 text-center text-gray-600 text-xs">{it.received_qty}</td>
                        <td className="py-2 px-3 text-center">
                          <input type="number" min="0" max={remaining}
                            value={receiveQty[it.id] ?? 0}
                            onChange={(e) => setQty(it.id, e.target.value)}
                            disabled={remaining <= 0}
                            className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center disabled:bg-gray-100" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t-2 border-blue-950/10">
                <button onClick={() => setSelectedPO(null)}
                  className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 text-xs sm:text-sm">
                  Cancel
                </button>
                <button onClick={submit} disabled={saving}
                  className="bg-green-800 text-white px-6 py-2 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Confirm Receipt</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiveStock;
