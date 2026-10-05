import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, X, User, Mail, Phone, Lock,
  Eye, EyeOff, Shield, Check, AlertCircle, RefreshCw, Loader2, KeyRound
} from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    status: "active",
    groups: [],
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [users, groups, userGroups] = await Promise.all([
          invoke("list_users"),
          invoke("list_groups"),
          invoke("get_user_groups", { userId: id }),
        ]);
        const u = users.find(x => x.id === id);
        if (!u) {
          setError("User not found.");
          return;
        }
        setFormData({
          fullName: u.full_name,
          username: u.username,
          email: u.email || "",
          phone: u.phone || "",
          status: u.status,
          groups: userGroups,
        });
        setAvailableGroups(groups);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load user.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleGroup = (gid) => {
    setFormData({
      ...formData,
      groups: formData.groups.includes(gid)
        ? formData.groups.filter(x => x !== gid)
        : [...formData.groups, gid],
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.fullName.trim() || formData.groups.length === 0) {
      setError("Please fill in all required fields and pick at least one group.");
      return;
    }
    setSaving(true);
    try {
      await invoke("update_user", {
        userId: id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        status: formData.status,
      });
      await invoke("set_user_groups", {
        userId: id,
        groupIds: formData.groups,
      });
      setSuccess("User updated successfully.");
      setTimeout(() => navigate("/users/all"), 1200);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setResetting(true);
    try {
      await invoke("reset_user_password", { userId: id, newPassword });
      setNewPassword("");
      setSuccess("Password reset successfully.");
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not reset password.");
    } finally {
      setResetting(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pass);
    setShowPass(true);
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
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Edit User</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Update user details, groups and password</p>
        </div>
        <Link to="/users/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
            <ArrowLeft size={16} />
            <span>Back to Users</span>
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
          <Check size={16} className="text-green-800 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-800 font-bold">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Full Name *</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <User size={18} className="text-gray-400 mr-2" />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Username</label>
                <input type="text" value={formData.username} readOnly
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-gray-500 outline-none bg-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Phone size={18} className="text-gray-400 mr-2" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Groups *</h2>
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
          </div>

          {/* Password reset */}
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-950">Reset Password</h2>
              <button type="button" onClick={generatePassword}
                className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                <RefreshCw size={14} /> Generate
              </button>
            </div>
            <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
              <Lock size={18} className="text-gray-400 mr-2" />
              <input type={showPass ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password or generate"
                className="w-full text-sm font-medium text-blue-950 outline-none tracking-widest" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="text-gray-400 hover:text-blue-950 ml-2">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="button" onClick={handleResetPassword} disabled={resetting || !newPassword}
              className="mt-3 bg-orange-500 text-white px-6 py-2 font-bold hover:bg-orange-600 transition-colors border-2 border-orange-500 flex items-center gap-2 disabled:opacity-60 text-xs sm:text-sm">
              {resetting ? <><Loader2 size={16} className="animate-spin" /> Resetting…</> : <><KeyRound size={16} /> Reset Password</>}
            </button>
          </div>
        </div>

        {/* Actions sidebar */}
        <div>
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button type="button" onClick={handleSave} disabled={saving}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Save Changes</>}
            </button>
            <Link to="/users/all">
              <button type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <X size={18} /> Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
