import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Smartphone,
  Printer,
  X,
  User,
  Package,
  CheckCircle,
  Barcode,
  Scan,
  AlertCircle,
  Landmark,
  Wallet,
  Receipt,
  ClipboardList
} from "lucide-react";

const POS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [changeDue, setChangeDue] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const barcodeInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const products = [
    { id: 1, name: "Hammer", sku: "TOOL-001", price: 24.99, stock: 145, category: "Tools", barcode: "8901234567890" },
    { id: 2, name: "Paint Roller", sku: "PAINT-003", price: 12.50, stock: 8, category: "Paint", barcode: "8901234567891" },
    { id: 3, name: "Screwdriver Set", sku: "TOOL-005", price: 45.00, stock: 0, category: "Tools", barcode: "8901234567892" },
    { id: 4, name: "Drill Bits", sku: "TOOL-018", price: 18.75, stock: 7, category: "Tools", barcode: "8901234567893" },
    { id: 5, name: "Measuring Tape", sku: "TOOL-012", price: 8.99, stock: 3, category: "Tools", barcode: "8901234567894" },
    { id: 6, name: "Circular Saw", sku: "TOOL-025", price: 189.00, stock: 32, category: "Power Tools", barcode: "8901234567895" },
    { id: 7, name: "Paint Brush Set", sku: "PAINT-001", price: 15.99, stock: 45, category: "Paint", barcode: "8901234567896" },
    { id: 8, name: "Level Tool", sku: "TOOL-008", price: 34.50, stock: 22, category: "Tools", barcode: "8901234567897" }
  ];

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setModalData(null);
  };

  const handleBarcodeScan = (e) => {
    const value = e.target.value;
    if (value && value.length > 0) {
      const product = products.find(p => p.barcode === value);
      if (product) {
        addToCart(product);
        setSearchTerm("");
        e.target.value = "";
      } else {
        showCustomModal("Product not found with this barcode", "error");
        e.target.value = "";
      }
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showCustomModal(`${product.name} is out of stock!`, "error");
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        showCustomModal(`Not enough stock available for ${product.name}!`, "error");
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.price }]);
    }
    showCustomModal(`${product.name} added to cart!`, "success");
  };

  const updateQuantity = (id, change) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
      showCustomModal(`${item.name} removed from cart`, "info");
      return;
    }
    const product = products.find(p => p.id === id);
    if (newQty > product.stock) {
      showCustomModal(`Not enough stock available for ${product.name}!`, "error");
      return;
    }
    setCart(cart.map(i =>
      i.id === id
        ? { ...i, quantity: newQty, total: newQty * i.price }
        : i
    ));
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(i => i.id !== id));
    if (item) {
      showCustomModal(`${item.name} removed from cart`, "info");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const openPaymentModal = () => {
    if (cart.length === 0) {
      showCustomModal("Cart is empty! Add products first.", "error");
      return;
    }
    if (!customer || customer.trim() === "") {
      showCustomModal("Please enter customer name", "error");
      return;
    }
    setPaymentAmount("");
    setChangeDue(0);
    setPaymentMethod("");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    if (!paymentMethod) {
      showCustomModal("Please select a payment method", "error");
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showCustomModal("Please enter a valid payment amount", "error");
      return;
    }
    if (amount < total) {
      showCustomModal(`Insufficient amount. Total is $${total.toFixed(2)}`, "error");
      return;
    }
    const change = amount - total;
    setChangeDue(change);
    setShowPaymentModal(false);
    setShowCheckoutModal(true);
  };

  const confirmCheckout = () => {
    setShowCheckoutModal(false);
    setIsProcessing(true);
    
    const order = {
      invoice: `INV-${Date.now().toString().slice(-6)}`,
      customer: customer,
      items: cart.length,
      total: total.toFixed(2),
      payment: paymentMethod,
      amountPaid: paymentAmount,
      changeDue: changeDue.toFixed(2),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      cartItems: [...cart]
    };
    
    setOrderData(order);
    setShowSuccessModal(true);
    setIsProcessing(false);
  };

  const resetPOS = () => {
    setShowSuccessModal(false);
    setCart([]);
    setCustomer("Walk-in Customer");
    setPaymentMethod("");
    setPaymentAmount("");
    setChangeDue(0);
    setOrderData(null);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      showCustomModal("Cart is empty!", "error");
      return;
    }
    showCustomModal("Receipt sent to printer", "info");
  };

  const clearCart = () => {
    if (cart.length === 0) {
      showCustomModal("Cart is already empty", "info");
      return;
    }
    setCart([]);
    showCustomModal("Cart cleared successfully", "info");
  };

  const paymentMethods = [
    { id: "Cash", icon: DollarSign, label: "Cash" },
    { id: "Card", icon: CreditCard, label: "Credit/Debit Card" },
    { id: "Mobile", icon: Smartphone, label: "Mobile Payment" },
    { id: "Bank", icon: Landmark, label: "Bank Transfer" }
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Point of Sale</h1>
          <p className="text-gray-600 font-medium text-sm">Scan barcodes, add products, and process payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            <span className="text-sm">Print</span>
          </button>
          <Link to="/sales/all">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ShoppingCart size={18} />
              <span className="text-sm">All Sales</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertCircle size={28} className="text-red-800" />}
                {modalType === "info" && <AlertCircle size={28} className="text-blue-950" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : modalType === "error" ? "Error" : "Information"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
            </div>
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <Wallet size={24} />
                Process Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4 space-y-4">
              <div className="bg-gray-50 p-3 border-l-4 border-blue-950">
                <p className="text-sm text-gray-600">Total Amount Due</p>
                <p className="text-2xl font-bold text-blue-950">${total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Customer: {customer}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      className={`py-2 font-bold text-sm border-2 transition-colors flex items-center justify-center gap-2 ${
                        paymentMethod === method.id
                          ? 'bg-blue-950 text-white border-blue-950'
                          : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <method.icon size={16} />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Amount Received</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePaymentSubmit}
                className="flex-1 bg-green-800 text-white py-2 font-bold hover:bg-green-900 transition-colors border-2 border-green-800"
              >
                Process Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
              <ClipboardList size={24} />
              Confirm Order
            </h3>
            <div className="mb-4 space-y-2">
              <p className="text-gray-700 font-medium">Customer: <span className="font-bold text-blue-950">{customer}</span></p>
              <p className="text-gray-700 font-medium">Items: <span className="font-bold text-blue-950">{cart.length}</span></p>
              <div className="border-t border-gray-200 pt-2 mt-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 font-medium">Subtotal: <span className="font-bold text-blue-950">${subtotal.toFixed(2)}</span></p>
              <p className="text-gray-700 font-medium">Tax: <span className="font-bold text-blue-950">${tax.toFixed(2)}</span></p>
              <p className="text-gray-700 font-medium text-lg">Total: <span className="font-bold text-blue-950">${total.toFixed(2)}</span></p>
              <p className="text-gray-700 font-medium">Payment: <span className="font-bold text-blue-950">{paymentMethod}</span></p>
              <p className="text-gray-700 font-medium">Amount Paid: <span className="font-bold text-green-800">${paymentAmount}</span></p>
              <p className="text-gray-700 font-medium">Change: <span className="font-bold text-orange-600">${changeDue.toFixed(2)}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmCheckout}
                disabled={isProcessing}
                className="flex-1 bg-green-800 text-white py-2 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Order"}
              </button>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && orderData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="text-center mb-4">
              <CheckCircle size={48} className="text-green-800 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-blue-950">Order Completed!</h3>
              <p className="text-gray-600 font-medium">Transaction successful</p>
            </div>
            <div className="bg-gray-50 p-4 border-l-4 border-blue-950 mb-4">
              <p className="text-sm font-bold text-blue-950">Invoice: {orderData.invoice}</p>
              <p className="text-sm text-gray-600">Customer: {orderData.customer}</p>
              <p className="text-sm text-gray-600">Items: {orderData.items}</p>
              <p className="text-sm text-gray-600">Payment: {orderData.payment}</p>
              <p className="text-sm font-bold text-blue-950">Total: ${orderData.total}</p>
              <p className="text-sm text-green-800">Change: ${orderData.changeDue}</p>
              <p className="text-xs text-gray-500">{orderData.date} {orderData.time}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetPOS}
                className="flex-1 bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
              >
                New Sale
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  showCustomModal("Receipt sent to printer", "info");
                }}
                className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center border-2 border-blue-950/10 px-3 py-2">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  className="w-full text-sm font-medium text-blue-950 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 bg-blue-50">
                <Barcode size={18} className="text-blue-950 mr-2" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode"
                  className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeScan(e);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white p-4 border-2 border-blue-950/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => addToCart(product)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-blue-950 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{product.sku}</p>
                    <p className="text-sm font-bold text-blue-950 mt-1">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 font-medium">Stock: {product.stock}</p>
                  </div>
                  <div className="bg-blue-950 text-white px-2 py-1 text-xs font-bold">
                    {product.category}
                  </div>
                </div>
                {product.stock <= 0 && (
                  <div className="mt-2 bg-red-800 text-white text-xs font-bold px-2 py-1 text-center">
                    Out of Stock
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400 font-medium">
                  Barcode: {product.barcode}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-950">Cart</h2>
            <span className="text-sm font-medium text-gray-600">{cart.length} items</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-blue-950" />
            <input
              type="text"
              placeholder="Customer name"
              className="flex-1 border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 border-2 border-blue-950/10">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Cart is empty</p>
                <p className="text-xs text-gray-400">Add products to start</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-blue-950 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.sku}</p>
                        <p className="text-sm font-bold text-blue-950">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-800 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-gray-200 hover:bg-gray-300 text-blue-950 font-bold px-2 py-1 border-2 border-gray-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-blue-950 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-blue-950 font-bold px-2 py-1 border-2 border-gray-300"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="ml-auto font-bold text-blue-950">${item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t-2 border-blue-950/10 pt-4 mt-4">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Tax (7.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-950 pt-2 border-t-2 border-blue-950/10 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={openPaymentModal}
                disabled={cart.length === 0}
                className="w-full bg-green-800 text-white py-3 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wallet size={18} />
                Proceed to Payment
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;