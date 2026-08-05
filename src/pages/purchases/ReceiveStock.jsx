import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Search,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  Save,
  X
} from "lucide-react";

const ReceiveStock = () => {
  const [poNumber, setPoNumber] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);

  const purchaseOrders = [
    {
      id: "PO-2026-001",
      supplier: "ABC Supplies",
      date: "2026-08-05",
      items: [
        { product: "Hammer", sku: "TOOL-001", ordered: 50, received: 0, status: "Pending" },
        { product: "Paint Roller", sku: "PAINT-003", ordered: 30, received: 0, status: "Pending" }
      ]
    },
    {
      id: "PO-2026-002",
      supplier: "XYZ Distributors",
      date: "2026-08-04",
      items: [
        { product: "Screwdriver Set", sku: "TOOL-005", ordered: 40, received: 0, status: "Pending" },
        { product: "Drill Bits", sku: "TOOL-018", ordered: 25, received: 0, status: "Pending" }
      ]
    }
  ];

  const handleSearchPO = () => {
    const po = purchaseOrders.find(p => p.id === poNumber);
    if (po) {
      setSelectedPO(po);
      setReceivedItems(po.items.map(item => ({ ...item, received: 0 })));
    } else {
      alert("Purchase Order not found!");
    }
  };

  const handleReceiveChange = (index, value) => {
    const updated = [...receivedItems];
    updated[index].received = parseInt(value) || 0;
    setReceivedItems(updated);
  };

  const handleSubmit = () => {
    alert("Stock received successfully!");
    setSelectedPO(null);
    setPoNumber("");
    setReceivedItems([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Receive Stock</h1>
          <p className="text-gray-600 font-medium text-sm">Process incoming stock from purchase orders</p>
        </div>
        <Link to="/purchases/orders">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Orders</span>
          </button>
        </Link>
      </div>

      {!selectedPO ? (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Search Purchase Order</h2>
          <p className="text-sm text-gray-600 font-medium mb-4">Enter the PO number to receive stock</p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center border-2 border-blue-950/10 px-3 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Enter PO Number (e.g., PO-2026-001)"
                className="w-full text-sm font-medium text-blue-950 outline-none"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearchPO}
              className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              Search
            </button>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-medium">Available POs: PO-2026-001, PO-2026-002</p>
          </div>
        </div>
      ) : (
        <div>
          {/* PO Details */}
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-blue-950">Receive Stock: {selectedPO.id}</h2>
                <p className="text-sm text-gray-600 font-medium">Supplier: {selectedPO.supplier}</p>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="text-red-800 hover:text-red-900 transition-colors font-bold text-sm flex items-center gap-1"
              >
                <X size={16} />
                Cancel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Ordered</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Received</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-bold text-blue-950">{item.product}</td>
                      <td className="py-2 px-3 text-gray-600 font-medium text-xs">{item.sku}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-950">{item.ordered}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.received}
                          onChange={(e) => handleReceiveChange(index, e.target.value)}
                          className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-center mx-auto block"
                          placeholder="0"
                          max={item.ordered}
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.received >= item.ordered ? (
                          <span className="text-green-800 font-bold flex items-center justify-center gap-1">
                            <CheckCircle size={14} />
                            Complete
                          </span>
                        ) : item.received > 0 ? (
                          <span className="text-orange-600 font-bold flex items-center justify-center gap-1">
                            <AlertCircle size={14} />
                            Partial
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t-2 border-blue-950/10">
              <button
                onClick={handleSubmit}
                className="bg-green-800 text-white px-6 py-2 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 flex items-center gap-2"
              >
                <Save size={18} />
                Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveStock;