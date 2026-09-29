import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Plus, Search, Eye, Edit, Trash2, Users,
  KeyRound, Save, X, Check
} from "lucide-react";

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  const groups = [
    { id: 1, name: "Admin", description: "Full system access", userCount: 1, permissionCount: 32, locked: true },
    { id: 2, name: "Cashier", description: "POS and sales only", userCount: 2, permissionCount: 8, locked: false },
    { id: 3, name: "Storekeeper", description: "Stock management", userCount: 1, permissionCount: 10, locked: false },
    { id: 4, name: "Manager", description: "Day-to-day operations", userCount: 0, permissionCount: 20, locked: false },
    { id: 5, name: "Accountant", description: "Reports and invoices", userCount: 0, permissionCount: 6, locked: false },
  ];

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setShowForm(false);
    setGroupName("");
    setGroupDesc("");
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Groups</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Bundles of permissions you assign to users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>New Group</span>
          </button>
          <Link to="/users/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <Users size={16} />
              <span>Users</span>
            </button>
          </Link>
          <Link to="/users/permissions">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <KeyRound size={16} />
              <span>Permissions</span>
            </button>
          </Link>
        </div>
      </div>

      {/* New group form */}
      {showForm && (
        <div className="bg-white p-4 sm:p-6 border-2 border-orange-500 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Create Group</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Group Name *</label>
              <input
                type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Weekend Staff"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Description</label>
              <input
                type="text" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="What is this group for?"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <button type="submit" className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2">
                <Save size={16} /> Create Group
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input
            type="text" placeholder="Search groups..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Groups grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <div key={g.id} className="bg-white border-2 border-blue-950/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-950 p-3 border-2 border-white/20">
                    <Shield size={20} color="white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950 text-lg">{g.name}</h3>
                    {g.locked && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        System Group
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-medium mb-4">{g.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 p-2 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Users</p>
                  <p className="text-lg font-bold text-blue-950">{g.userCount}</p>
                </div>
                <div className="bg-gray-50 p-2 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Permissions</p>
                  <p className="text-lg font-bold text-blue-950">{g.permissionCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button className="text-blue-950 hover:text-blue-700 transition-colors">
                  <Eye size={16} />
                </button>
                <button className="text-orange-600 hover:text-orange-800 transition-colors">
                  <Edit size={16} />
                </button>
                {!g.locked && (
                  <button className="text-red-800 hover:text-red-900 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
