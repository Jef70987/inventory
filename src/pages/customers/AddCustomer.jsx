import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, CheckCircle, AlertCircle, User, Mail, Phone,
  MapPin, Loader2, Users
} from "lucide-react";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "",
    state: "", zipCode: "", country: "", status: "active", notes: "",
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const g = await invoke("list_customer_groups");
        setGroups(g);
      } catch {}
    })();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleGroup = (id) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      await invoke("create_customer", {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null,
        country: formData.country.trim() || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
        groupIds: selectedGroups,
      });
      setSuccess(true);
      setTimeout(() => navigate("/customers/all"), 1200);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Add Customer</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Create a new customer profile</p>
        </div>
        <Link to="/customers/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} />
            <span>Back to Customers</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Full Name *</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <User size={18} className="text-gray-400 mr-2" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Enter full name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone *</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Phone size={18} className="text-gray-400 mr-2" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="+254 7XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <MapPin size={18} className="text-gray-400 mr-2" />
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Street address" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="City" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">State/Province</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="State" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">ZIP Code</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="ZIP code" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Country" />
              </div>
            </div>
          </div>

          {groups.length > 0 && (
            <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-950">Customer Groups</h2>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Users size={14} /> Optional
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {groups.map((g) => {
                  const selected = selectedGroups.includes(g.id);
                  return (
                    <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                      className={`flex items-center justify-between p-3 border-2 text-sm font-bold transition-colors ${
                        selected ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-blue-950 border-blue-950/10 hover:border-blue-950/30"
                      }`}>
                      <span>{g.name}</span>
                      {g.discount_pct > 0 && (
                        <span className="text-[10px] font-bold opacity-80">-{g.discount_pct}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Additional Notes</h2>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"
              className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              placeholder="Additional notes about the customer..."></textarea>
          </div>
        </div>

        <div>
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button type="button" onClick={handleSubmit} disabled={saving}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Add Customer</>}
            </button>
            <Link to="/customers/all">
              <button type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <X size={18} /> Cancel
              </button>
            </Link>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800 font-bold">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
                <CheckCircle size={16} className="text-green-800 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800 font-bold">Customer added successfully.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
