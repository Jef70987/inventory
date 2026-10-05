import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ShoppingCart, Search, Filter, Eye, Printer, Download,
  CheckCircle, Clock, XCircle, RefreshCw, DollarSign, Users,
  Loader2, AlertCircle, X
} from "lucide-react";

const AllSales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke("list_sales", { limit: 200 });
      setSales(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (sale) => {
    setSelectedSale(sale);
    setDetailLoading(true);
    try {
      const d = await invoke("get_sale", { saleId: sale.id });
      setDetail(d);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load sale details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedSale(null);
    setDetail(null);
  };

  const getStatusColor = (status) => ({
    completed: "bg-green-800 text-white",
    processing: "bg-blue-950 text-white",
    pending: "bg-orange-600 text-white",
    refunded: "bg-red-800 text-white",
    void: "bg-gray-700 text-white",
  }[status] || "bg-gray-700 text-white");

  const getStatusIcon = (status) => {
    if (status === "completed") return <CheckCircle size={12} />;
    if (status === "processing") return <RefreshCw size={12} />;
    if (status === "pending") return <Clock size={12} />;
    if (status === "refunded" || status === "void") return <XCircle size={12} />;
    return null;
  };

  const filtered = sales.filter(s =>
    !searchTerm ||
    s.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = sales.length;
  const totalRevenue = sales.filter(s => s.status !== "refunded" && s.status !== "void")
    .reduce((sum, s) => sum + s.total, 0);
  const completedCount = sales.filter(s => s.status === "completed").length;
  const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">All Sales</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Complete sales history and transaction records</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/sales/pos">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
              <ShoppingCart size={16} /> New Sale
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Sales" value={totalSales} icon={ShoppingCart} color="border-blue-950" bg="bg-blue-950" />
        <Stat label="Revenue" value={`KSH ${totalRevenue.toFixed(2)}`} icon={DollarSign} color="border-green-800" bg="bg-green-800" />
        <Stat label="Completed" value={completedCount} icon={CheckCircle} color="border-orange-600" bg="bg-orange-600" />
        <Stat label="Avg Order" value={`KSH ${avgOrder.toFixed(2)}`} icon={Users} color="border-blue-950" bg="bg-blue-950" />
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search by receipt or customer..."
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Receipt</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Payment</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
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
                No sales yet. Click "New Sale" to make one.
              </td></tr>
            )}
            {!loading && filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{s.receipt_no}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{s.customer_name || "Walk-in"}</td>
                <td className="py-3 px-4 text-center text-gray-600 font-medium">{s.items_count}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {s.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-600 font-medium capitalize">{s.payment_methods || "—"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold whitespace-nowrap ${getStatusColor(s.status)}`}>
                    {getStatusIcon(s.status)} {s.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                  {s.sold_at?.slice(0, 16).replace("T", " ")}
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => openDetail(s)}
                    className="text-blue-950 hover:text-blue-700 transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white shadow-2xl w-full max-w-md my-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950">Sale Details</h2>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin inline text-blue-950" />
              </div>
            ) : detail ? (
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                <div className="bg-blue-950 p-3 mb-4 text-center">
                  <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Receipt</p>
                  <p className="text-lg font-bold text-white">{detail.receipt_no}</p>
                </div>

                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-bold">Date</span>
                    <span className="font-bold text-blue-950">{detail.sold_at?.slice(0, 19).replace("T", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-bold">Customer</span>
                    <span className="font-bold text-blue-950">{detail.customer_name || "Walk-in"}</span>
                  </div>
                  {detail.cashier_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-bold">Cashier</span>
                      <span className="font-bold text-blue-950">{detail.cashier_name}</span>
                    </div>
                  )}
                  {detail.warehouse_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-bold">Warehouse</span>
                      <span className="font-bold text-blue-950">{detail.warehouse_name}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-dashed border-gray-300 py-3 my-3">
                  <p className="text-[10px] font-bold text-blue-950 uppercase tracking-wider mb-2">Items</p>
                  {detail.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-blue-950">{it.product_name}</p>
                        <p className="text-[10px] text-gray-500">{it.quantity} × {it.unit_price.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-blue-950">{it.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs border-t-2 border-dashed border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-bold">Subtotal</span>
                    <span className="font-bold text-blue-950">KSH {detail.subtotal.toFixed(2)}</span>
                  </div>
                  {detail.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-bold">Discount</span>
                      <span className="font-bold text-orange-600">-KSH {detail.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-1 mt-1">
                    <span className="font-bold text-blue-950">Total</span>
                    <span className="font-bold text-blue-950">KSH {detail.total.toFixed(2)}</span>
                  </div>
                  {detail.payments.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600 font-bold capitalize">Paid ({p.method})</span>
                      <span className="font-bold text-green-800">KSH {p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {detail.change_due > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-bold">Change</span>
                      <span className="font-bold text-orange-600">KSH {detail.change_due.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="p-4 border-t-2 border-blue-950/10 flex justify-end">
              <button onClick={closeDetail}
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors text-xs sm:text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`bg-white p-4 border-l-4 ${color} shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-blue-950">{value}</p>
    </div>
    <div className={`${bg} p-2 border-2 border-white/20`}>
      <Icon size={18} color="white" />
    </div>
  </div>
);

export default AllSales;
