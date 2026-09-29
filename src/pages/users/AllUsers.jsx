import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Search, Plus, Eye, Edit, Trash2, Shield,
  CheckCircle, XCircle, KeyRound, UserCog
} from "lucide-react";

const AllUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, username: "jeff_admin", fullName: "Jeff Mwangi", email: "jeff@shop.com", phone: "+254 700 000 001", groups: ["Admin"], status: "Active", lastLogin: "2026-09-29 08:12" },
    { id: 2, username: "mary_cashier", fullName: "Mary Wanjiku", email: "mary@shop.com", phone: "+254 700 000 002", groups: ["Cashier"], status: "Active", lastLogin: "2026-09-29 07:45" },
    { id: 3, username: "brian_cashier", fullName: "Brian Otieno", email: "brian@shop.com", phone: "+254 700 000 003", groups: ["Cashier"], status: "Inactive", lastLogin: "2026-09-20 18:30" },
    { id: 4, username: "grace_store", fullName: "Grace Njeri", email: "grace@shop.com", phone: "+254 700 000 004", groups: ["Storekeeper"], status: "Active", lastLogin: "2026-09-28 17:05" },
  ];

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.groups.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) =>
    status === "Active"
      ? "bg-green-800 text-white"
      : "bg-red-800 text-white";

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === "Active").length;
  const admins = users.filter(u => u.groups.includes("Admin")).length;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">All Users</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Manage system users and their groups</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/users/add">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </Link>
          <Link to="/users/groups">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors text-xs sm:text-sm">
              <Shield size={16} />
              <span>Groups</span>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-950">{totalUsers}</p>
          </div>
          <div className="bg-blue-950 p-2 border-2 border-white/20">
            <Users size={20} color="white" />
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active</p>
            <p className="text-xl sm:text-2xl font-bold text-green-800">{activeCount}</p>
          </div>
          <div className="bg-green-800 p-2 border-2 border-white/20">
            <CheckCircle size={20} color="white" />
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Admins</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{admins}</p>
          </div>
          <div className="bg-orange-600 p-2 border-2 border-white/20">
            <UserCog size={20} color="white" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or group..."
            className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Groups</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Last Login</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-blue-950">{u.fullName}</p>
                  <p className="text-xs text-gray-500 font-medium">@{u.username}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-700 font-medium">{u.email}</p>
                  <p className="text-sm text-gray-700 font-medium">{u.phone}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {u.groups.map((g, i) => (
                      <span key={i} className="text-xs font-bold bg-blue-950 text-white px-2 py-0.5">
                        {g}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs">{u.lastLogin}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-950 hover:text-blue-700 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="text-orange-600 hover:text-orange-800 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-800 hover:text-red-900 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsers;
