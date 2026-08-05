import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Printer,
  Download
} from "lucide-react";

const CreatePurchaseOrder = () => {
  const [orderItems, setOrderItems] = useState([
    { id: 1, product: "Hammer", sku: "TOOL-001", quantity: 50, price: "$12.50", total: "$625.00" },
    { id: 2, product: "Paint Roller", sku: "PAINT-003", quantity: 30, price: "$6.00", total: "$180.00" }
  ]);

  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: "",
    notes: "",
    status: "Pending"
  });

  const suppliers = ["ABC Supplies", "XYZ Distributors", "Global Tools", "Local Hardware", "Mega Store"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = orderItems.reduce((sum, item) => sum + parseFloat(item.total.replace('$', '')), 0);
    alert(`Purchase Order created successfully! Total: $${total.toFixed(2)}`);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), product: "", sku: "", quantity: 0, price: "$0.00", total: "$0.00" }]);
  };

  const removeItem = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Create Purchase Order</h1>
          <p className="text-gray-600 font-medium text-sm">Generate a new purchase order for suppliers</p>
        </div>
        <Link to="/purchases/orders">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Orders</span>
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Order Details */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Order Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Supplier</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup, index) => (
                      <option key={index} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Order Date</label>
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-950">Order Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 bg-blue-950 text-white px-3 py-1 text-sm font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.product}
                            className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                            placeholder="Product name"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.sku}
                            className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                            placeholder="SKU"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.quantity}
                            className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-center"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.price}
                            className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                            placeholder="$0.00"
                          />
                        </td>
                        <td className="py-2 px-3 font-bold text-blue-950">{item.total}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-800 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-blue-950/10">
                      <td colSpan="4" className="py-3 px-3 text-right font-bold text-blue-950">Grand Total:</td>
                      <td className="py-3 px-3 font-bold text-blue-950 text-lg">
                        ${orderItems.reduce((sum, item) => sum + parseFloat(item.total.replace('$', '') || 0), 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Additional notes or instructions..."
              ></textarea>
            </div>

            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
              <button
                type="submit"
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Create Order
              </button>
              <button
                type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print Preview
              </button>
              <button
                type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;