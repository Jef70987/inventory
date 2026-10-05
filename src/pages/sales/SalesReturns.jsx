import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Search, Eye, CheckCircle, Clock, XCircle, RefreshCw,
  Package, DollarSign, Loader2, AlertCircle, X, Plus, Trash2, Save
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const SalesReturns = () => {
  const [returns, setReturns] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  // New return form
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [disposition, setDisposition] = useState("restock");

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        invoke("list_returns"),
        invoke("list_sales", { limit: 200 }),
      ]);
      setReturns(r);
      setSales(s);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadSaleItems = async (saleId) => {
    try {
      const d = await invoke("get_sale", { saleId });
      setSaleItems(d.items);
      setReturnItems(d.items.map(i => ({ ...i, return_qty: 0 })));
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load sale items.");
    }
  };

  const pickSale = async (sale) => {
    setSelectedSale(sale);
    await loadSaleItems(sale.id);
  };

  const updateReturnQty = (pid, qty) => {
    setReturnItems(returnItems.map(i =>
      i.product_id === pid ? { ...i, return_qty: Number(qty) || 0 } : i
    ));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedSale) { setError("Select a sale."); return; }
    const items = returnItems.filter(i => i.return_qty > 0).map(i => ({
      product_id: i.product_id,
      quantity: i.return_qty,
      unit_price: i.unit_price,
    }));
    if (items.length === 0) { setError("Set a return quantity for at least one item."); return; }
    if (!reason.trim()) { setError("Enter a reason."); return; }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await invoke("create_return", {
        saleId: selectedSale.id,
        items,
        reason: reason.trim(),
        refundMethod,
        stockDisposition: disposition,
        userId: user?.id || null,
      });
      setShowForm(false);
      setSelectedSale(null);
      setSaleItems([]);
      setReturnItems([]);
      setReason("");
      setDisposition("restock");
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create return.");
    } finally {
      setSaving(false);
    }
  };

  const approveNow = async () => {
    if (!confirmApprove) return;
    try {
      await invoke("approve_return", { returnId: confirmApprove.id });
      setConfirmApprove(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not approve return.");
      setConfirmApprove(null);
    }
  };

  const rejectNow = async () => {
    if (!confirmReject) return;
    try {
      await invoke("reject_return", { returnId: confirmReject.id });
      setConfirmReject(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not reject return.");
      setConfirmReject(null);
    }
  };

  const getStatusColor = (s) => ({
    approved: "bg-green-800 text-white",
    pending: "bg-orange-600 text-white",
    rejected: "bg-red-800 text-white",
    processing: "bg-blue-950 text-white",
  }[s] || "bg-gray-700 text-white");

  const getStatusIcon = (s) => {
    if (s === "approved") return <CheckCircle size={12} />;
    if (s === "pending") return <Clock size={12} />;
    if (s === "rejected") return <XCircle size={12} />;
    return <RefreshCw size={12} />;
  };

  const filtered = returns.filter(r =>
    !searchTerm ||
    r.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.receipt_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReturns = returns.length;
  const approvedCount = returns.filter(r => r.status === "approved").length;
  const pendingCount = returns.filter(r => r.status === "pending").length;
  const totalRefund = returns.filter(r => r.status === "approved")
    .reduce((s, r) => s + r.refund_amount, 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Sales Returns</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage product returns and refunds</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/sales/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <ArrowLeft size={16} /> Sales
            </button>
          </Link>
          <button onClick={() => { setShowForm(true); setSelectedSale(null); setSaleItems([]); setReturnItems([]); setReason(""); setDisposition("restock"); }}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
            <Plus size={16} /> New Return
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Returns" value={totalReturns} color="border-blue-950" />
        <Stat label="Approved" value={approvedCount} color="border-green-800" />
        <Stat label="Pending" value={pendingCount} color="border-orange-600" />
        <Stat label="Total Refunded" value={`KSH ${totalRefund.toFixed(2)}`} color="border-blue-950" />
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by return number, receipt, or customer..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Return #</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Receipt</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Refund</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reason</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                No returns yet.
              </td></tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{r.return_number}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{r.receipt_no || "—"}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{r.customer_name || "Walk-in"}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{r.item_count}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {r.refund_amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">{r.reason || "—"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(r.status)}`}>
                    {getStatusIcon(r.status)} {r.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(r)} className="text-blue-950 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => setConfirmApprove(r)}
                          className="text-green-800 hover:text-green-900 text-xs font-bold">Approve</button>
                        <button onClick={() => setConfirmReject(r)}
                          className="text-red-800 hover:text-red-900 text-xs font-bold">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Return Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">New Sales Return</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Sale picker */}
              {!selectedSale ? (
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Select Original Sale
                  </label>
                  <div className="max-h-72 overflow-y-auto border-2 border-blue-950/10">
                    {sales.filter(s => s.status === "completed").length === 0 ? (
                      <p className="p-4 text-center text-gray-500 text-xs font-medium">No eligible sales to return.</p>
                    ) : sales.filter(s => s.status === "completed").map(s => (
                      <button key={s.id} type="button" onClick={() => pickSale(s)}
                        className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-blue-950 text-xs">{s.receipt_no}</p>
                          <p className="text-[10px] text-gray-500">
                            {s.customer_name || "Walk-in"} · {s.items_count} items · {s.sold_at?.slice(0, 10)}
                          </p>
                        </div>
                        <span className="font-bold text-blue-950 text-xs">KSH {s.total.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-950 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-950 text-sm">{selectedSale.receipt_no}</p>
                      <p className="text-[10px] text-gray-600">{selectedSale.customer_name || "Walk-in"}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedSale(null); setReturnItems([]); }}
                      className="text-xs font-bold text-red-800 hover:text-red-900 uppercase">
                      Change
                    </button>
                  </div>

                  {/* Items with qty inputs */}
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                      Return Quantities
                    </label>
                    <table className="w-full text-sm border-2 border-blue-950/10">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase">Product</th>
                          <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Sold</th>
                          <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase">Return</th>
                          <th className="text-right py-2 px-3 font-bold text-blue-950 text-xs uppercase">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnItems.map(it => (
                          <tr key={it.product_id} className="border-t border-gray-100">
                            <td className="py-2 px-3 font-bold text-blue-950 text-xs">{it.product_name}</td>
                            <td className="py-2 px-3 text-center text-gray-600 text-xs">{it.quantity}</td>
                            <td className="py-2 px-3 text-center">
                              <input type="number" min="0" max={it.quantity} value={it.return_qty}
                                onChange={(e) => updateReturnQty(it.product_id, e.target.value)}
                                className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-bold text-blue-950 outline-none text-center" />
                            </td>
                            <td className="py-2 px-3 text-right text-xs font-bold text-blue-950">
                              KSH {it.unit_price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reason *</label>
                      <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                        className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                        placeholder="e.g., Damaged item" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Refund Method</label>
                      <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}
                        className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                        <option value="cash">Cash</option>
                        <option value="mobile">M-Pesa</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank</option>
                        <option value="credit">Store Credit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Stock Condition *</label>
                      <select value={disposition} onChange={(e) => setDisposition(e.target.value)}
                        className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                        <option value="restock">Resellable — Add back to stock</option>
                        <option value="write_off">Damaged / Expired — Write-off</option>
                      </select>
                    </div>
                  </div>

                  <div className={`p-3 border-l-4 ${
                    disposition === "restock" ? "bg-green-50 border-green-800" : "bg-red-50 border-red-600"
                  }`}>
                    <p className="text-xs font-bold text-blue-950">
                      Refund Amount: KSH{" "}
                      {returnItems.reduce((s, i) => s + i.return_qty * i.unit_price, 0).toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-bold mt-1 ${
                      disposition === "restock" ? "text-green-800" : "text-red-800"
                    }`}>
                      {disposition === "restock"
                        ? "✓ Items will be added back to inventory on approval"
                        : "✕ Items will be written off — NOT added back to inventory"}
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10">
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !selectedSale}
                  className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Create Return</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6">
          <div className="bg-white shadow-2xl w-full max-w-md border-t-4 border-orange-500">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Return Details</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-950 p-3 mb-3 text-center">
                <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Return</p>
                <p className="text-lg font-bold text-white">{detail.return_number}</p>
              </div>
              <div className="text-xs space-y-1 mb-3">
                <div className="flex justify-between"><span className="text-gray-600 font-bold">Receipt</span><span className="font-bold text-blue-950">{detail.receipt_no}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-bold">Customer</span><span className="font-bold text-blue-950">{detail.customer_name || "Walk-in"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-bold">Reason</span><span className="font-bold text-blue-950">{detail.reason || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-bold">Refund Method</span><span className="font-bold text-blue-950 capitalize">{detail.refund_method}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-bold">Stock</span><span className={`font-bold ${detail.stock_disposition === "write_off" ? "text-red-800" : "text-green-800"}`}>{detail.stock_disposition === "write_off" ? "Write-off" : "Restocked"}</span></div>
              </div>
              <div className="border-t-2 border-dashed border-gray-300 py-3">
                <p className="text-[10px] font-bold text-blue-950 uppercase mb-2">Items</p>
                {detail.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <span className="font-bold text-blue-950">{it.product_name} × {it.quantity}</span>
                    <span className="font-bold text-blue-950">KSH {(it.quantity * it.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold border-t-2 border-dashed border-gray-300 pt-3">
                <span className="text-blue-950">Total Refund</span>
                <span className="text-blue-950">KSH {detail.refund_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmApprove}
        title="Approve Return"
        message={`Approve ${confirmApprove?.return_number}? Stock will be added back and the sale marked as refunded.`}
        confirmLabel="Approve"
        danger={false}
        onConfirm={approveNow}
        onCancel={() => setConfirmApprove(null)}
      />

      <ConfirmModal
        open={!!confirmReject}
        title="Reject Return"
        message={`Reject ${confirmReject?.return_number}? No stock will be returned.`}
        confirmLabel="Reject"
        onConfirm={rejectNow}
        onCancel={() => setConfirmReject(null)}
      />
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm`}>
    <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-blue-950">{value}</p>
  </div>
);

export default SalesReturns;
