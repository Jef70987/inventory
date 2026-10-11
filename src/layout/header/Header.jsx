import { useState, useEffect } from "react";
import { Bell, Menu, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

const Header = ({ onToggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }

    const token = localStorage.getItem("session_token");
    if (token) {
      invoke("get_me", { sessionToken: token })
        .then((u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        })
        .catch(() => {});
    }
  }, []);

  const displayName = user?.full_name || user?.username || "User";
  const displayRole = user?.is_superuser ? "Superuser" : "Administrator";
  const initial = (displayName || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b-2 border-blue-950 shadow-sm px-4 md:px-6 h-20 flex items-center justify-between flex-shrink-0 relative">
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-blue-950 p-1"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-sm md:text-lg font-bold text-blue-950 truncate">Inventory Pro</h1>
        <span className="hidden md:inline-block text-xs font-semibold text-blue-950 bg-blue-950/10 px-2 py-1">Panel</span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button className="relative text-blue-950 hover:text-orange-500 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 border-l-2 border-blue-950/20 pl-3 md:pl-4 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{initial}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-blue-950 leading-tight truncate max-w-[140px]">
                {displayName}
              </p>
              <p className="text-xs text-blue-950/70 font-medium">
                {displayRole}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`hidden md:block text-blue-950/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-blue-950/10 shadow-lg z-50">
                <div className="p-3 border-b-2 border-blue-950/10">
                  <p className="text-sm font-bold text-blue-950 truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    @{user?.username || "user"}
                  </p>
                </div>
                <Link
                  to="/auth/logout"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-800 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
