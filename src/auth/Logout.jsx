import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth/login");
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 size={32} className="text-blue-950 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">Signing out…</p>
      </div>
    </div>
  );
};

export default Logout;
