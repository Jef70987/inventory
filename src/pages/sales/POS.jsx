import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ShoppingCart, Search, Plus, Minus, Trash2, Printer, X, User,
  CheckCircle, Barcode, AlertCircle, Landmark, Wallet, Receipt,
  ClipboardList, Loader2, DollarSign, Smartphone, CreditCard
} from "lucide-react";

const POS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [nextReceipt, setNextReceipt] = useState("");
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeRef = useRef(null);

  const loadData = async () => {
    try {
      const [p, c, r] = await Promise.all([
        invoke("list_products", { search: null, categoryId: null, onlyActive: true }),
        invoke("list_customers", { search: null }),
        invoke("preview_next_receipt"),
      ]);
      setProducts(p);
      setCustomers(c);
      setNextReceipt(r);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not load data.");
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (barcodeRef.current) barcodeRef.current.focus();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode || "").includes(searchTerm)
  );

  const handleBarcode = (e) => {
    if (e.key === "Enter") {
      const code = e.target.value.trim();
      if (!code) return;
      const p = products.find(x => x.barcode === code || x.sku === code);
      if (p) {
        addToCart(p);
        e.target.value = "";
        setSearchTerm("");
      } else {
        setError("Product not found");
        setTimeout(() => setError(""), 1500);
        e.target.value = "";
      }
    }
  };

  const addToCart = (p) => {
    if (p.total_stock <= 0) {
      setError(`${p.name} is out of stock`);
      setTimeout(() => setError(""), 1500);
      return;
    }
    const existing = cart.find(i => i.product_id === p.id);
    if (existing) {
      if (existing.quantity >= p.total_stock) {
        setError(`Only ${p.total_stock} available`);
        setTimeout(() => setError(""), 1500);
        return;
      }
      setCart(cart.map(i =>
        i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, {
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        unit_price: p.sell_price,
        quantity: 1,
        stock_available: p.total_stock,
      }]);
    }
  };

  const updateQty = (pid, qty) => {
    const n = Number(qty);
    if (n <= 0) {
      setCart(cart.filter(i => i.product_id !== pid));
      return;
    }
    const p = products.find(x => x.id === pid);
    if (p && n > p.total_stock) {
      setError(`Only ${p.total_stock} available`);
      setTimeout(() => setError(""), 1500);
      return;
    }
    setCart(cart.map(i => i.product_id === pid ? { ...i, quantity: n } : i));
  };

  const removeItem = (pid) => setCart(cart.filter(i => i.product_id !== pid));
  const clearCart = () => { setCart([]); setCustomer(null); };

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const total = subtotal;

  const openPayment = () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      setTimeout(() => setError(""), 1500);
      return;
    }
    setPaymentAmount(total.toFixed(2));
    setPaymentMethod("cash");
    setPaymentRef("");
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    setError("");
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid payment amount");
      return;
    }
    if (amount + 0.001 < total) {
      setError(`Payment must be at least KSH ${total.toFixed(2)}`);
      return;
    }
    if (paymentMethod === "mobile" && !paymentRef.trim()) {
      setError("Enter M-Pesa reference");
      return;
    }
    setProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const receiptData = await invoke("complete_sale", {
        items: cart.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: 0,
        })),
        payments: [{
          method: paymentMethod,
          amount,
          reference: paymentRef.trim() || null,
        }],
        customerId: customer?.id || null,
        warehouseId: null,
        userId: user?.id || null,
        discountAmount: 0,
        notes: null,
      });
      setReceipt(receiptData);
      setShowPayment(false);
      setShowReceipt(true);
      await loadData();
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not complete sale.");
    } finally {
      setProcessing(false);
    }
  };

  const finishSale = () => {
    setShowReceipt(false);
    setReceipt(null);
    setCart([]);
    setCustomer(null);
    setSearchTerm("");
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const methodIcon = (m) => ({
    cash: DollarSign,
    mpesa: Smartphone,
    card: CreditCard,
    bank: Landmark,
  }[m] || Wallet);

  return (
    <div className="p-3 sm:p-4 bg-gray-50 h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Point of Sale</h1>
          <p className="text-xs text-gray-600 font-medium">
            Next receipt: <span className="font-bold text-orange-600">{nextReceipt}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/sales/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs">
              <Receipt size={14} /> All Sales
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-600 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-600" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Product Grid */}
        <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
          <div className="bg-white p-3 border-2 border-blue-950/10 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center border-2 border-blue-950/10 px-3 py-2">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  ref={barcodeRef}
                  type="text"
                  placeholder="Search or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleBarcode}
                  className="w-full text-sm font-medium text-blue-950 outline-none"
                />
                <Barcode size={16} className="text-gray-400 ml-2" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white border-2 border-blue-950/10 p-3">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 font-medium py-8 text-sm">
                No products found.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredProducts.map(p => {
                  const out = p.total_stock <= 0;
                  return (
                    <button key={p.id} onClick={() => addToCart(p)} disabled={out}
                      className={`text-left p-3 border-2 border-blue-950/10 hover:border-orange-500 hover:shadow-md transition-all ${
                        out ? "opacity-40 cursor-not-allowed" : ""
                      }`}>
                      <p className="font-bold text-blue-950 text-xs leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">{p.sku}</p>
                      <p className="text-sm font-bold text-orange-600 mt-2">KSH {p.sell_price.toFixed(2)}</p>
                      <p className={`text-[10px] font-bold mt-1 ${out ? "text-red-800" : "text-green-800"}`}>
                        Stock: {p.total_stock}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white border-2 border-blue-950/10 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b-2 border-blue-950/10 flex items-center justify-between">
            <h2 className="font-bold text-blue-950 flex items-center gap-2 text-sm">
              <ShoppingCart size={16} /> Cart ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-red-800 hover:text-red-900 text-xs font-bold">
                Clear
              </button>
            )}
          </div>

          {/* Customer */}
          <div className="p-3 border-b-2 border-blue-950/10">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-950" />
              <select
                value={customer?.id || ""}
                onChange={(e) => {
                  const c = customers.find(x => x.id === e.target.value);
                  setCustomer(c || null);
                }}
                className="flex-1 border-2 border-blue-950/10 px-2 py-1 text-xs font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                <option value="">Walk-in Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">Cart is empty</p>
                <p className="text-[10px] text-gray-400">Scan or click products</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(i => (
                  <div key={i.product_id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-blue-950 text-xs truncate">{i.product_name}</p>
                        <p className="text-[10px] text-gray-500">{i.sku}</p>
                      </div>
                      <button onClick={() => removeItem(i.product_id)}
                        className="text-red-800 hover:text-red-900">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(i.product_id, i.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-blue-950 font-bold p-1">
                          <Minus size={12} />
                        </button>
                        <input type="number" value={i.quantity}
                          onChange={(e) => updateQty(i.product_id, e.target.value)}
                          className="w-12 text-center text-xs font-bold text-blue-950 border-2 border-gray-200 outline-none" />
                        <button onClick={() => updateQty(i.product_id, i.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-blue-950 font-bold p-1">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-bold text-blue-950 text-xs">
                        KSH {(i.unit_price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total + Checkout */}
          <div className="border-t-2 border-blue-950/10 p-3">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Subtotal</span>
              <span>KSH {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-950 pt-2 border-t-2 border-blue-950/10 mt-2">
              <span>Total</span>
              <span>KSH {total.toFixed(2)}</span>
            </div>
            <button onClick={openPayment} disabled={cart.length === 0}
              className="w-full mt-3 bg-green-800 text-white py-3 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
              <Wallet size={16} /> Charge KSH {total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4">
          <div className="bg-white border-t-4 border-orange-500 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b-2 border-blue-950/10">
              <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <Wallet size={20} /> Payment
              </h2>
              <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-blue-950 p-4 mb-4 text-center">
                <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Amount Due</p>
                <p className="text-3xl font-bold text-white mt-1">KSH {total.toFixed(2)}</p>
                <p className="text-xs text-orange-200 mt-1">
                  {customer ? customer.name : "Walk-in Customer"}
                </p>
              </div>

              <p className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { id: "cash", label: "Cash", icon: DollarSign },
                  { id: "mobile", label: "M-Pesa", icon: Smartphone },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "bank", label: "Bank", icon: Landmark },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`py-2.5 font-bold text-xs border-2 transition-colors flex items-center justify-center gap-2 ${
                      paymentMethod === m.id
                        ? "bg-blue-950 text-white border-blue-950"
                        : "bg-white text-blue-950 border-blue-950/20 hover:border-blue-950/40"
                    }`}>
                    <m.icon size={14} /> {m.label}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                Amount Received
              </label>
              <input type="number" step="0.01" value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border-2 border-blue-950/10 px-3 py-3 text-lg font-bold text-blue-950 outline-none focus:border-blue-950 mb-3"
                placeholder="0.00" />

              {paymentMethod !== "cash" && (
                <>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    {paymentMethod === "mobile" ? "M-Pesa Reference" : "Reference"} *
                  </label>
                  <input type="text" value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 mb-3"
                    placeholder="e.g., QK7X9Y2Z" />
                </>
              )}

              {Number(paymentAmount) > total && (
                <div className="p-3 bg-orange-50 border-l-4 border-orange-500 mb-3">
                  <p className="text-xs text-blue-950 font-bold">
                    Change: KSH {(Number(paymentAmount) - total).toFixed(2)}
                  </p>
                </div>
              )}

              {error && <p className="text-xs text-red-600 font-bold mb-3">{error}</p>}

              <div className="flex gap-2">
                <button onClick={() => setShowPayment(false)} disabled={processing}
                  className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={confirmPayment} disabled={processing}
                  className="flex-1 bg-green-800 text-white py-3 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 disabled:opacity-50 flex items-center justify-center gap-2">
                  {processing ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : "Complete Sale"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6 overflow-y-auto">
          <div className="bg-white shadow-2xl w-full max-w-sm my-6">
            <div className="p-6 font-mono text-xs text-gray-800">
              <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
                <h1 className="text-base font-bold text-blue-950">Inventory Pro</h1>
                <p className="text-[10px] text-gray-600">Sales Receipt</p>
                <p className="text-[10px] font-bold mt-1">{receipt.receipt_no}</p>
              </div>

              <div className="text-[10px] space-y-0.5 mb-3">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{receipt.sold_at?.slice(0, 19).replace("T", " ")}</span>
                </div>
                {receipt.cashier_name && (
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{receipt.cashier_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{receipt.customer_name || "Walk-in"}</span>
                </div>
              </div>

              <table className="w-full text-[10px] border-t-2 border-b-2 border-dashed border-gray-400 py-2 my-3">
                <thead>
                  <tr>
                    <th className="text-left">Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-0.5">{it.product_name}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-right">{it.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{receipt.subtotal.toFixed(2)}</span>
                </div>
                {receipt.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{receipt.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t-2 border-dashed border-gray-400 pt-1 mt-1">
                  <span>TOTAL:</span>
                  <span>KSH {receipt.total.toFixed(2)}</span>
                </div>
                {receipt.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>Paid ({p.method}):</span>
                    <span>{p.amount.toFixed(2)}</span>
                  </div>
                ))}
                {receipt.change_due > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Change:</span>
                    <span>{receipt.change_due.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="text-center border-t-2 border-dashed border-gray-400 mt-3 pt-3">
                <p className="text-[10px] text-gray-600">Thank you for your business!</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Powered by Syntelsafe</p>
              </div>
            </div>

            <div className="p-4 border-t-2 border-gray-100 flex gap-2">
              <button onClick={finishSale}
                className="flex-1 bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm">
                <CheckCircle size={16} /> New Sale
              </button>
              <button onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
