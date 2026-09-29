import { useState } from "react";
import {
  Search, Activity, User, Package, FileText, Settings,
  ShoppingCart, Users, LogIn, Filter, Download
} from "lucide-react";

const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const events = [
    { id: 1, user: "jeff_admin", action: "Created product", target: "Hammer (TOOL-001)", module: "Inventory", ip: "127.0.0.1", time: "2026-09-29 08:45:12" },
    { id: 2, user: "mary_cashier", action: "Completed sale", target: "INV-2026-0142 - KSH 3,450", module: "Sales", ip: "127.0.0.1", time: "2026-09-29 08:30:41" },
    { id: 3, user: "jeff_admin", action: "Updated customer", target: "John Doe", module: "Customers", ip: "127.0.0.1", time: "2026-09-29 08:12:03" },
    { id: 4, user: "mary_cashier", action: "Login", target: "Session started", module: "Auth", ip: "127.0.0.1", time: "2026-09-29 07:45:00" },
    { id: 5, user: "grace_store", action: "Received stock", target: "PO-2026-0018", module: "Purchases", ip: "127.0.0.1", time: "2026-09-28 17:05:33" },
    { id: 6, user: "jeff_admin", action: "Changed settings", target: "Tax rate 7.5% → 8%", module: "System", ip: "127.0.0.1", time: "2026-09-28 15:20:10" },
    { id: 7, user: "mary_cashier", action: "Refunded sale", target: "INV-2026-0139 - KSH 560", module: "Sales", ip: "127.0.0.1", time: "2026-09-28 14:12:55" },
    { id: 8, user: "jeff_admin", action: "Created user", target: "brian_cashier", module: "Users", ip: "127.0.0.1", time: "2026-09-28 10:00:00" },
  ];

  const getModuleIcon = (module) => {
    const map = {
      Inventory: Package,
      Sales: ShoppingCart,
      Customers: Users,
      Purchases: FileText,
      System: Settings,
      Users: User,
      Auth: LogIn,
    };
    return map[module] || Activity;
  };

  const getModuleColor = (module) => {
    const map = {
      Inventory: "bg-green-800",
      Sales: "bg-blue-950",
      Customers: "bg-purple-800",
      Purchases: "bg-orange-600",
      System: "bg-red-800",
      Users: "bg-cyan-800",
      Auth: "bg-gray-700",
    };
    return map[module] || "bg-gray-700";
  };

  const filtered = events.filter(e =>
    e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Audit Trail</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Complete log of every action in the system</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm w-fit">
          <Download size={16} />
          <span>Export Log</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Events</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-950">{events.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today</p>
          <p className="text-xl sm:text-2xl font-bold text-green-800">4</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Users Active</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600">3</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Warnings</p>
          <p className="text-xl sm:text-2xl font-bold text-red-800">0</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text" placeholder="Search by user, action, or target..."
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Modules</option>
            <option>Sales</option>
            <option>Inventory</option>
            <option>Customers</option>
            <option>Users</option>
            <option>System</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Time</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Module</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Target</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const Icon = getModuleIcon(e.module);
              return (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{e.time}</td>
                  <td className="py-3 px-4 font-bold text-blue-950 whitespace-nowrap">{e.user}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-white ${getModuleColor(e.module)}`}>
                      <Icon size={12} />
                      {e.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{e.action}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{e.target}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{e.ip}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No audit events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
