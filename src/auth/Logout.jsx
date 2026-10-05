import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Loader2 } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("session_token");
      if (token) {
        try {
          await invoke("logout", { sessionToken: token });
        } catch (e) {
          console.error("Logout failed:", e);
        }
      }
      localStorage.removeItem("session_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      navigate("/auth/login", { replace: true });
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 size={32} className="text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-xs text-orange-200 uppercase tracking-widest font-bold">Signing out…</p>
      </div>
    </div>
  );
};

export default Logout;
