import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, User, Mail, Phone, DollarSign, ShoppingCart, Calendar,
  CheckCircle, Clock, XCircle, Loader2, AlertCircle, Printer
} from "lucide-react";

const PurchaseHistory = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          invoke("get_customer", { customerId: id }),
          invoke("list_customer_purchases", { customerId: id }),
        ]);
        setCustomer(c);
        setPurchases(p);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load purchases.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatusColor = (status) => {
    const map = {
      completed: "bg-green-800 text-white",
      pending: "bg-orange-600 text-white",
      refunded: "bg-red-800 text-white",
      processing: "bg-blue-950 text-white",
      void: "bg-gray-700 text-white",
    };
    return map[status] || "bg-gray-700 text-white";
  };

  const getStatusIcon = (status) => {
    if (status === "completed") return <CheckCircle size={12} />;
    if (status === "pending") return <Clock size={12} />;
    if (status === "refunded" || status === "void") return <XCircle size={12} />;
    return null;
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Purchase History</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Customer purchase transactions</p>
        </div>
        <Link to="/customers/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} />
            <span>Back to Customers</span>
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      {customer && (
        <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                <User size={14} /> Customer
              </p>
              <p className="font-bold text-blue-950 text-lg">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Mail size={14} /> Email
              </p>
              <p className="text-gray-700 font-medium">{customer.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Phone size={14} /> Phone
              </p>
              <p className="text-gray-700 font-medium">{customer.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                <DollarSign size={14} /> Total Spend
              </p>
              <p className="font-bold text-green-800 text-lg">KSH {customer.total_purchases.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-blue-950">{customer?.total_orders || 0}</p>
          </div>
          <div className="bg-blue-950 p-2 border-2 border-white/20">
            <ShoppingCart size={20} color="white" />
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-800">
              {purchases.filter(p => p.status === "completed").length}
            </p>
          </div>
          <div className="bg-green-800 p-2 border-2 border-white/20">
            <CheckCircle size={20} color="white" />
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Customer Since</p>
            <p className="text-sm font-bold text-orange-600">
              {customer?.joined_at?.slice(0, 10) || "—"}
            </p>
          </div>
          <div className="bg-orange-600 p-2 border-2 border-white/20">
            <Calendar size={20} color="white" />
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Receipt</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No purchases yet.
                </td>
              </tr>
            )}
            {purchases.map((p) => (
              <tr key={p.sale_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-blue-950">{p.receipt_no}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">{p.sold_at?.slice(0, 19).replace("T", " ")}</td>
                <td className="py-3 px-4 text-center text-gray-600">{p.items}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-950">KSH {p.total.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold ${getStatusColor(p.status)}`}>
                    {getStatusIcon(p.status)}
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="text-gray-600 hover:text-gray-800 transition-colors">
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseHistory;
