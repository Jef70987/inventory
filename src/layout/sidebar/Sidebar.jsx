import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { sidebarData } from "../sidebardata/sidebarData";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenDropdown(null);
    }
  };

  const toggleDropdown = (index) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const isActive = (link) => {
    return location.pathname === link || location.pathname.startsWith(link + "/");
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={24} color="white" /> : null;
  };

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-blue-950 shadow-md z-50 lg:hidden">
          <div className="flex items-center justify-between px-4 py-1">
            <button onClick={toggle} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="relative">
                <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-cover border border-white/30 shadow-lg" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-orange-400 border border-white rounded-full animate-pulse"></span>
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-white font-bold text-sm leading-tight">Inventory Pro</h1>
              </div>
            </button>
            <div className="text-right">
              <p className="text-white text-xs font-semibold">Admin User</p>
              <p className="text-orange-200 text-[10px] font-medium">Administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-950 shadow-lg z-50 lg:hidden">
          <div className="flex items-center h-12 px-2 overflow-x-auto">
            <div className="flex justify-around gap-1">
              {sidebarData.slice(0, 6).map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className={`flex flex-col items-center justify-center px-2 py-1 transition-all duration-300 min-w-[60px] ${
                    isActive(item.link) ? "text-white bg-orange-600/50" : "text-orange-100"
                  }`}
                >
                  <div className="text-base mb-0.5">{getIcon(item.icon)}</div>
                  <span className="text-[9px] font-semibold whitespace-nowrap">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Padding for mobile */}
      <div className={isMobile ? "pt-12 pb-12" : ""}>
        {/* Your page content will go here */}
      </div>

      {/* Toggle Button for Desktop */}
      {!isMobile && (
        <button
          onClick={toggle}
          className="fixed top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white p-3 shadow-xl border-2 border-orange-400/50 transition-all duration-300 hover:scale-110 z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`h-screen bg-blue-950 shadow-2xl border-r-0 transition-all duration-500 ease-in-out z-50 fixed lg:relative top-0 left-0 overflow-hidden flex flex-col ${
          isCollapsed ? "w-20" : "w-72"
        } ${isCollapsed && isMobile ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
        </div>

        {/* Decorative Element */}
        <div className="absolute right-0 top-0 h-32 w-32 bg-white/5" style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)", opacity: 0.2 }}></div>

        {/* Header */}
        <div className="relative z-10">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div
            className={`flex items-center p-5 border-b border-white/10 bg-blue-950 backdrop-blur-sm ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "flex-col" : "space-x-4"}`}>
              <div className="relative group">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className={`relative object-cover border-2 border-white/40 shadow-2xl ${
                    isCollapsed ? "w-12 h-12" : "w-14 h-14"
                  }`}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-orange-400 border-2 border-white rounded-full animate-pulse"></span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <h1 className="text-white font-bold text-lg leading-tight">Inventory Pro</h1>
                  <p className="text-sm font-extrabold text-white/80 truncate">Administrator</p>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={toggle}
                className={`bg-orange-600/50 hover:bg-orange-600 backdrop-blur-sm text-white p-2 shadow-lg border-2 border-orange-400/40 transition-all duration-300 hover:scale-110 hover:rotate-180 ${
                  isCollapsed ? "absolute -right-3 top-5" : ""
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {sidebarData.map((item, index) => (
              <li key={index}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`flex items-center w-full p-3 cursor-pointer transition-all duration-300 group relative overflow-hidden text-white hover:bg-orange-600/50 ${
                        isActive(item.link) ? "bg-orange-600" : ""
                      } ${isCollapsed ? "justify-center" : "justify-start"}`}
                    >
                      <div className="flex-shrink-0 transition-all duration-300">{getIcon(item.icon)}</div>
                      {!isCollapsed && (
                        <span className="ml-3 font-bold whitespace-nowrap text-white flex-1 text-left">{item.title}</span>
                      )}
                      {!isCollapsed && (
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${openDropdown === index ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    {!isCollapsed && openDropdown === index && (
                      <ul className="ml-6 mt-1 space-y-1 border-l-2 border-orange-400/30 pl-3">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.link}
                              className={`block py-2 px-3 text-sm font-semibold transition-all duration-300 ${
                                isActive(subItem.link) ? "text-orange-400 bg-orange-600/20" : "text-white/70 hover:text-white hover:bg-orange-600/20"
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.link}
                    className={`flex items-center w-full p-3 cursor-pointer transition-all duration-300 group relative overflow-hidden text-white hover:bg-orange-600/50 ${
                      isActive(item.link) ? "bg-orange-600" : ""
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="flex-shrink-0 transition-all duration-300">{getIcon(item.icon)}</div>
                    {!isCollapsed && <span className="ml-3 font-bold whitespace-nowrap text-white">{item.title}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className={`relative z-10 border-t border-orange-700/30 p-4 bg-orange-900/20 backdrop-blur-md ${
            isCollapsed ? "text-center" : ""
          }`}
        >
          <div className={`text-white/80 ${isCollapsed ? "text-xs" : "text-sm"}`}>
            {!isCollapsed ? (
              <div>
                <p className="font-bold text-white">© 2026 Inventory Pro</p>
                <p className="text-xs text-white/60 font-semibold">Powered by Syntelsafe</p>
              </div>
            ) : (
              <span className="text-xs font-bold text-white">©2026</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;