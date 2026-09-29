import { useState } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound, Search, Save, Check, Users, Shield, Info
} from "lucide-react";

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Cashier");

  const groups = ["Admin", "Cashier", "Storekeeper", "Manager", "Accountant"];

  // Permissions grouped by module — Django-style
  const permissionModules = [
    {
      module: "Sales / POS",
      permissions: [
        { code: "sales.pos", label: "Use POS" },
        { code: "sales.view_own", label: "View own sales" },
        { code: "sales.view_all", label: "View all sales" },
        { code: "sales.refund", label: "Process refunds" },
        { code: "sales.void", label: "Void sales" },
        { code: "sales.discount", label: "Apply discounts" },
        { code: "sales.discount_override", label: "Override max discount" },
      ],
    },
    {
      module: "Inventory",
      permissions: [
        { code: "inventory.view", label: "View products" },
        { code: "inventory.create", label: "Add products" },
        { code: "inventory.edit", label: "Edit products" },
        { code: "inventory.delete", label: "Delete products" },
        { code: "inventory.adjust_stock", label: "Adjust stock" },
        { code: "inventory.bulk_import", label: "Bulk import" },
      ],
    },
    {
      module: "Customers",
      permissions: [
        { code: "customers.view", label: "View customers" },
        { code: "customers.create", label: "Add customers" },
        { code: "customers.edit", label: "Edit customers" },
        { code: "customers.delete", label: "Delete customers" },
      ],
    },
    {
      module: "Purchases",
      permissions: [
        { code: "purchases.view", label: "View purchase orders" },
        { code: "purchases.create", label: "Create purchase orders" },
        { code: "purchases.receive", label: "Receive stock" },
        { code: "purchases.approve", label: "Approve purchases" },
      ],
    },
    {
      module: "Invoices",
      permissions: [
        { code: "invoices.view", label: "View invoices" },
        { code: "invoices.create", label: "Create invoices" },
        { code: "invoices.edit", label: "Edit invoices" },
        { code: "invoices.settings", label: "Invoice settings" },
      ],
    },
    {
      module: "Reports",
      permissions: [
        { code: "reports.sales", label: "Sales reports" },
        { code: "reports.inventory", label: "Inventory reports" },
        { code: "reports.financial", label: "Financial reports" },
        { code: "reports.export", label: "Export reports" },
      ],
    },
    {
      module: "Users & Access",
      permissions: [
        { code: "users.view", label: "View users" },
        { code: "users.create", label: "Create users" },
        { code: "users.edit", label: "Edit users" },
        { code: "users.delete", label: "Delete users" },
        { code: "users.groups", label: "Manage groups" },
        { code: "users.permissions", label: "Manage permissions" },
      ],
    },
    {
      module: "System",
      permissions: [
        { code: "system.settings", label: "System settings" },
        { code: "system.backup", label: "Backups" },
        { code: "system.restore", label: "Restore data" },
        { code: "system.license", label: "License" },
        { code: "system.api_keys", label: "API keys" },
      ],
    },
  ];

  // Demo: what permissions each group currently has
  const initialGroupPermissions = {
    Admin: permissionModules.flatMap(m => m.permissions.map(p => p.code)),
    Cashier: ["sales.pos", "sales.view_own", "customers.view", "customers.create", "inventory.view"],
    Storekeeper: ["inventory.view", "inventory.create", "inventory.edit", "inventory.adjust_stock", "inventory.bulk_import", "purchases.view", "purchases.receive"],
    Manager: ["sales.view_all", "sales.refund", "sales.discount", "inventory.view", "inventory.edit", "customers.view", "customers.edit", "purchases.view", "purchases.create", "reports.sales", "reports.inventory"],
    Accountant: ["sales.view_all", "invoices.view", "invoices.create", "reports.sales", "reports.financial", "reports.export"],
  };

  const [groupPermissions, setGroupPermissions] = useState(initialGroupPermissions);

  const toggle = (code) => {
    if (selectedGroup === "Admin") return; // Admin locked
    const current = groupPermissions[selectedGroup] || [];
    const next = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];
    setGroupPermissions({ ...groupPermissions, [selectedGroup]: next });
  };

  const currentPerms = groupPermissions[selectedGroup] || [];

  const filteredModules = permissionModules.map(m => ({
    ...m,
    permissions: m.permissions.filter(p =>
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(m => m.permissions.length > 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
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
          <button className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-xs sm:text-sm">
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Group selector sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-blue-950/10 shadow-sm">
            <div className="p-4 border-b-2 border-blue-950/10">
              <h2 className="font-bold text-blue-950 text-sm uppercase tracking-wider">Groups</h2>
            </div>
            <ul>
              {groups.map((g) => (
                <li key={g}>
                  <button
                    onClick={() => setSelectedGroup(g)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-gray-100 ${
                      selectedGroup === g
                        ? "bg-orange-500 text-white"
                        : "text-blue-950 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{g}</span>
                      <span className={`text-[10px] font-bold ${selectedGroup === g ? "text-white" : "text-gray-500"}`}>
                        {(groupPermissions[g] || []).length}
                      </span>
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

        {/* Permissions table */}
        <div className="lg:col-span-3">
          <div className="bg-white p-3 sm:p-4 border-2 border-blue-950/10 shadow-sm mb-4">
            <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
              <Search size={18} className="text-gray-400" />
              <input
                type="text" placeholder="Search permissions..."
                className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    const checked = currentPerms.includes(p.code);
                    const locked = selectedGroup === "Admin";
                    return (
                      <label
                        key={p.code}
                        className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-colors ${
                          checked ? "border-orange-500 bg-orange-50" : "border-blue-950/10 hover:border-blue-950/30"
                        } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(p.code)}
                          disabled={locked}
                          className="w-4 h-4 accent-orange-500"
                        />
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
    </div>
  );
};

export default Permissions;
