import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search, Activity, User, Package, FileText, Settings,
  ShoppingCart, Users, LogIn, Filter, Download, Loader2, AlertCircle
} from "lucide-react";

const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await invoke("list_audit_log", { limit: 200 });
        setEvents(data);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load audit log.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    (e.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.module || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.details || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEvents = events.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = events.filter(e => e.created_at.slice(0, 10) === today).length;
  const uniqueUsers = new Set(events.map(e => e.username).filter(Boolean)).size;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Events</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-950">{totalEvents}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today</p>
          <p className="text-xl sm:text-2xl font-bold text-green-800">{todayCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Users Active</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600">{uniqueUsers}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Warnings</p>
          <p className="text-xl sm:text-2xl font-bold text-red-800">0</p>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search by user, action, or module..."
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Time</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Module</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Target</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                  <Loader2 size={20} className="animate-spin inline mr-2" />
                  Loading audit events…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                  No audit events yet.
                </td>
              </tr>
            )}
            {!loading && filtered.map((e) => {
              const Icon = getModuleIcon(e.module);
              return (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{e.created_at}</td>
                  <td className="py-3 px-4 font-bold text-blue-950 whitespace-nowrap">{e.username || "system"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-white ${getModuleColor(e.module)}`}>
                      <Icon size={12} />
                      {e.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{e.action}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{e.details || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
