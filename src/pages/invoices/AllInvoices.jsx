import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  FileText, Search, Eye, Trash2, CheckCircle, Clock, AlertCircle,
  DollarSign, Plus, Loader2, X, Save
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const AllInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payRef, setPayRef] = useState("");
  const [paying, setPaying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_invoices", { search: searchTerm || null });
      setInvoices(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openDetail = async (inv) => {
    try {
      const full = await invoke("get_invoice", { invoiceId: inv.id });
      setDetail(full);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load invoice.");
    }
  };

  const deleteNow = async () => {
    if (!confirmDelete) return;
    try {
      await invoke("delete_invoice", { invoiceId: confirmDelete.id });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not delete invoice.");
      setConfirmDelete(null);
    }
  };

  const openPay = (inv) => {
    setPayModal(inv);
    setPayAmount(inv.balance.toFixed(2));
    setPayMethod("cash");
    setPayRef("");
  };

  const submitPay = async () => {
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    setPaying(true);
    try {
      await invoke("add_invoice_payment", {
        invoiceId: payModal.id,
        amount: amt,
        method: payMethod,
        reference: payRef.trim() || null,
      });
      setPayModal(null);
      await load();
      if (detail) await openDetail(detail);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not add payment.");
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (s) => ({
    paid: "bg-green-800 text-white",
    unpaid: "bg-orange-600 text-white",
    pending: "bg-blue-950 text-white",
    overdue: "bg-red-800 text-white",
    void: "bg-gray-700 text-white",
  }[s] || "bg-gray-700 text-white");

  const getStatusIcon = (s) => {
    if (s === "paid") return <CheckCircle size={12} />;
    if (s === "unpaid" || s === "pending") return <Clock size={12} />;
    if (s === "overdue") return <AlertCircle size={12} />;
    return null;
  };

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);
  const paidAmount = invoices.reduce((s, i) => s + i.amount_paid, 0);
  const outstanding = totalAmount - paidAmount;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">All Invoices</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage and track all customer invoices</p>
        </div>
        <Link to="/invoices/create">
          <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
            <Plus size={16} /> Create Invoice
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Invoices" value={totalInvoices} color="border-blue-950" />
        <Stat label="Total Amount" value={`KSH ${totalAmount.toFixed(0)}`} color="border-blue-950" />
        <Stat label="Paid" value={`KSH ${paidAmount.toFixed(0)}`} color="border-green-800" />
        <Stat label="Outstanding" value={`KSH ${outstanding.toFixed(0)}`} color="border-red-800" />
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by invoice number or customer..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Invoice #</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase">Items</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Total</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase">Balance</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Due</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                No invoices yet.
              </td></tr>
            )}
            {!loading && invoices.map(inv => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{inv.invoice_no}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{inv.customer_name || "—"}</td>
                <td className="py-3 px-4 text-center text-gray-600">{inv.items.length}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {inv.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-bold text-orange-600">KSH {inv.balance.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(inv.status)}`}>
                    {getStatusIcon(inv.status)} {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs">{inv.due_date || "—"}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetail(inv)} className="text-blue-950 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                    {inv.balance > 0 && (
                      <button onClick={() => openPay(inv)}
                        className="text-green-800 hover:text-green-900 text-xs font-bold">Pay</button>
                    )}
                    {inv.amount_paid === 0 && (
                      <button onClick={() => setConfirmDelete(inv)} className="text-red-800 hover:text-red-900">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white shadow-2xl w-full max-w-lg my-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Invoice {detail.invoice_no}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="text-xs space-y-1 mb-3">
                <Row label="Customer" value={detail.customer_name || "—"} />
                <Row label="Issue Date" value={detail.issue_date} />
                <Row label="Due Date" value={detail.due_date || "—"} />
                <Row label="Status" value={detail.status} />
              </div>
              <div className="border-t-2 border-dashed border-gray-300 py-3">
                <p className="text-[10px] font-bold text-blue-950 uppercase mb-2">Items</p>
                {detail.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-blue-950">{it.description}</p>
                      <p className="text-[10px] text-gray-500">{it.quantity} × {it.unit_price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-blue-950">KSH {it.line_total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs border-t-2 border-dashed border-gray-300 pt-3">
                <Row label="Subtotal" value={`KSH ${detail.subtotal.toFixed(2)}`} />
                {detail.discount_amount > 0 && (
                  <Row label="Discount" value={`-KSH ${detail.discount_amount.toFixed(2)}`} />
                )}
                <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1">
                  <span>Total</span>
                  <span>KSH {detail.total.toFixed(2)}</span>
                </div>
                <Row label="Paid" value={`KSH ${detail.amount_paid.toFixed(2)}`} />
                <Row label="Balance" value={`KSH ${detail.balance.toFixed(2)}`} />
              </div>
              {detail.payments.length > 0 && (
                <div className="mt-3 border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="text-[10px] font-bold text-blue-950 uppercase mb-2">Payments</p>
                  {detail.payments.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs py-1">
                      <span className="text-gray-600">{p.method} · {p.reference || "—"}</span>
                      <span className="font-bold text-green-800">KSH {p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4">
          <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Add Payment</h2>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-950 p-3 text-center">
                <p className="text-xs text-orange-200 font-bold uppercase">Balance Due</p>
                <p className="text-2xl font-bold text-white">KSH {payModal.balance.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Amount *</label>
                <input type="number" step="0.01" value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-lg font-bold text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none bg-white">
                  <option value="cash">Cash</option>
                  <option value="mobile">M-Pesa</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reference</label>
                <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Optional" />
              </div>
              <div className="flex gap-2 pt-3 border-t-2 border-blue-950/10">
                <button onClick={() => setPayModal(null)}
                  className="flex-1 border-2 border-blue-950/20 text-blue-950 py-3 font-bold text-xs uppercase">Cancel</button>
                <button onClick={submitPay} disabled={paying}
                  className="flex-1 bg-green-800 text-white py-3 font-bold text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-60">
                  {paying ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Add Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmDelete} title="Delete Invoice"
        message={`Delete ${confirmDelete?.invoice_no}? This cannot be undone.`}
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

export default AllInvoices;
