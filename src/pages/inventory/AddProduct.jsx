import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Upload,
  Barcode
} from "lucide-react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    reorder: "",
    description: "",
    supplier: "",
    location: "",
    weight: "",
    dimensions: ""
  });

  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  const categories = ["Tools", "Paint", "Power Tools", "Plumbing", "Electrical", "Wood", "Hardware", "Other"];
  const suppliers = ["ABC Supplies", "XYZ Distributors", "Global Tools", "Local Hardware", "Mega Store"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addVariant = () => {
    if (variantName && variantPrice) {
      setVariants([...variants, { name: variantName, price: variantPrice }]);
      setVariantName("");
      setVariantPrice("");
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product Data:", { ...formData, variants });
    alert("Product added successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Add New Product</h1>
          <p className="text-gray-600 font-medium text-sm">Create a new product entry in the inventory</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Products</span>
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">SKU</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                      placeholder="Enter SKU"
                      required
                    />
                    <button type="button" className="bg-blue-950 text-white px-3 border-2 border-blue-950 hover:bg-blue-900 transition-colors">
                      <Barcode size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Supplier</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup, index) => (
                      <option key={index} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Selling Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Cost Price</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorder"
                    value={formData.reorder}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Description</h2>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Product Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter product description..."
                ></textarea>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Product Variants</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="flex-1 border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Variant name (e.g., Large, Red)"
                />
                <input
                  type="number"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(e.target.value)}
                  className="w-32 border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Price"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-blue-950 text-white px-4 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
                >
                  <Plus size={18} />
                </button>
              </div>
              {variants.length > 0 && (
                <div className="border-2 border-blue-950/10">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Variant</th>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="py-2 px-3 font-medium text-blue-950">{variant.name}</td>
                          <td className="py-2 px-3 font-bold text-blue-950">${variant.price}</td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-800 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Additional Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Location / Shelf</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., Aisle 3, Shelf B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Dimensions (L x W x H)</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., 10 x 5 x 3 cm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
              <button
                type="submit"
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Product
              </button>
              <button
                type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                onClick={() => window.location.reload()}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;