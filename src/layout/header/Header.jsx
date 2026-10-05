import { Bell, Menu } from "lucide-react";

const Header = ({ onToggleSidebar }) => {
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

        <div className="flex items-center gap-2 border-l-2 border-blue-950/20 pl-3 md:pl-4">
          <div className="w-10 h-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-blue-950 leading-tight">Admin User</p>
            <p className="text-xs text-blue-950/70 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
