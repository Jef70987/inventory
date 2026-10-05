import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, User, Mail, Phone, Lock,
  Eye, EyeOff, Shield, Check, AlertCircle, RefreshCw, Loader2
} from "lucide-react";

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    status: "active",
    groups: [],
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const groups = await invoke("list_groups");
        setAvailableGroups(groups);
      } catch (e) {
        console.error("Could not load groups:", e);
      }
    })();
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setFormData({ ...formData, password: pass, confirmPassword: pass });
    setShowPassword(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleGroup = (id) => {
    setFormData({
      ...formData,
      groups: formData.groups.includes(id)
        ? formData.groups.filter(x => x !== id)
        : [...formData.groups, id],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.groups.length === 0) {
      setError("Please select at least one group.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const created = await invoke("create_user", {
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        groupId: formData.groups[0],
      });

      // Assign remaining groups if more than one selected
      if (formData.groups.length > 1) {
        await invoke("set_user_groups", {
          userId: created.id,
          groupIds: formData.groups,
        });
      }

      setSuccess(`User "${created.full_name}" created successfully.`);
      setTimeout(() => navigate("/users/all"), 1200);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "", username: "", email: "", phone: "",
      password: "", confirmPassword: "", status: "active", groups: [],
    });
    setError("");
    setSuccess("");
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Add User</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Create a new system user</p>
        </div>
        <Link to="/users/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} />
            <span>Back to Users</span>
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
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="e.g., Mary Wanjiku" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="e.g., mary_cashier" autoCapitalize="none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="user@shop.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Phone size={18} className="text-gray-400 mr-2" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="+254 7XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-950">Password</h2>
              <button type="button" onClick={generatePassword}
                className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                <RefreshCw size={14} /> Generate
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Password *</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Lock size={18} className="text-gray-400 mr-2" />
                  <input type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none tracking-widest" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-950 ml-2">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Confirm Password *</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Lock size={18} className="text-gray-400 mr-2" />
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none tracking-widest" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="text-gray-400 hover:text-blue-950 ml-2">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-950">Assign Groups *</h2>
              <Link to="/users/groups" className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                <Shield size={14} /> Manage Groups
              </Link>
            </div>
            {availableGroups.length === 0 ? (
              <p className="text-xs text-gray-500 font-medium">Loading groups…</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableGroups.map((g) => {
                  const selected = formData.groups.includes(g.id);
                  return (
                    <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                      className={`flex items-center justify-between p-3 border-2 text-sm font-bold transition-colors ${
                        selected ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-blue-950 border-blue-950/10 hover:border-blue-950/30"
                      }`}>
                      <span>{g.name}</span>
                      {selected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-gray-500 font-medium mt-2">
              A user gets all permissions from every group assigned here.
            </p>
          </div>
        </div>

        <div>
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button type="button" onClick={handleSubmit} disabled={saving}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Save User</>}
            </button>
            <button type="button" onClick={handleReset}
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <X size={18} /> Reset
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800 font-bold">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
                <Check size={16} className="text-green-800 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800 font-bold">{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
