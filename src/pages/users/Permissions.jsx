import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  KeyRound, Search, Save, Check, Users, Shield, Info,
  Loader2, AlertCircle
} from "lucide-react";

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentPerms, setCurrentPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [g, p] = await Promise.all([
          invoke("list_groups"),
          invoke("list_permissions"),
        ]);
        setGroups(g);
        setPermissions(p);
        if (g.length > 0) setSelectedGroup(g[0]);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    (async () => {
      try {
        const perms = await invoke("get_group_permissions", { groupId: selectedGroup.id });
        setCurrentPerms(perms);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load permissions.");
      }
    })();
  }, [selectedGroup]);

  const toggle = (permId) => {
    if (selectedGroup?.name === "Admin") return;
    setCurrentPerms(prev =>
      prev.includes(permId) ? prev.filter(x => x !== permId) : [...prev, permId]
    );
  };

  const handleSave = async () => {
    if (!selectedGroup || selectedGroup.name === "Admin") return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await invoke("set_group_permissions", {
        groupId: selectedGroup.id,
        permissionIds: currentPerms,
      });
      setSuccess(`Permissions saved for ${selectedGroup.name}.`);
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const grouped = {};
  permissions.forEach(p => {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  });

  const filteredModules = Object.entries(grouped)
    .map(([module, perms]) => ({
      module,
      permissions: perms.filter(p =>
        p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(m => m.permissions.length > 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Permissions</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Tick what each group is allowed to do</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/users/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <Users size={16} />
              <span>Users</span>
            </button>
          </Link>
          <Link to="/users/groups">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <Shield size={16} />
              <span>Groups</span>
            </button>
          </Link>
          <button onClick={handleSave} disabled={saving || selectedGroup?.name === "Admin"}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm disabled:opacity-50">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save</>}
          </button>
        </div>
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

      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin inline text-blue-950" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-blue-950/10 shadow-sm">
              <div className="p-4 border-b-2 border-blue-950/10">
                <h2 className="font-bold text-blue-950 text-sm uppercase tracking-wider">Groups</h2>
              </div>
              <ul>
                {groups.map((g) => (
                  <li key={g.id}>
                    <button onClick={() => setSelectedGroup(g)}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-gray-100 ${
                        selectedGroup?.id === g.id
                          ? "bg-orange-500 text-white"
                          : "text-blue-950 hover:bg-gray-50"
                      }`}>
                      <div className="flex items-center justify-between">
                        <span>{g.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-950 flex items-start gap-2">
              <Info size={16} className="text-blue-950 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-950 font-medium">
                Admin group is locked and always has all permissions.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-4">
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
                <Search size={18} className="text-gray-400" />
                <input type="text" placeholder="Search permissions..."
                  className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              {filteredModules.map((mod) => (
                <div key={mod.module} className="bg-white border-2 border-blue-950/10 shadow-sm">
                  <div className="px-4 py-3 border-b-2 border-blue-950/10 bg-gray-50 flex items-center gap-2">
                    <KeyRound size={16} className="text-blue-950" />
                    <h3 className="font-bold text-blue-950 text-sm uppercase tracking-wider">{mod.module}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mod.permissions.map((p) => {
                      const checked = currentPerms.includes(p.id);
                      const locked = selectedGroup?.name === "Admin";
                      return (
                        <label key={p.id}
                          className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-colors ${
                            checked ? "border-orange-500 bg-orange-50"
                            : "border-blue-950/10 hover:border-blue-950/30"
                          } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => toggle(p.id)} disabled={locked}
                            className="w-4 h-4 accent-orange-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-blue-950 truncate">{p.label}</p>
                            <p className="text-[10px] text-gray-500 font-medium truncate">{p.code}</p>
                          </div>
                          {checked && <Check size={14} className="text-orange-500 flex-shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
