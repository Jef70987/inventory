import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await invoke("login", {
        username: username.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("session_token", res.session_token);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/dashboard");
    } catch (err) {
      setError(typeof err === "string" ? err : "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Inventory <span className="text-orange-500">Pro</span></h1>
          <p className="text-xs text-orange-200 uppercase tracking-widest mt-2 font-bold">Sign in to your account</p>
        </div>
        <div className="bg-white border-t-4 border-orange-500 shadow-2xl p-8">
          <form className="space-y-4" onSubmit={submit} noValidate>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Username</label>
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                <User size={18} className="text-blue-950 mr-2" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username" spellCheck="false" autoCapitalize="none"
                  className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                  placeholder="Enter username" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Password</label>
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                <Lock size={18} className="text-blue-950 mr-2" />
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                  placeholder="Enter password" required />
                <button type="button" className="text-blue-950 hover:text-orange-500 ml-2"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-60">
              {loading ? "Checking…" : "Login"}
            </button>
            <Link to="/auth/forgot"
              className="block text-center text-xs text-blue-950 hover:text-orange-500 font-bold uppercase tracking-wider">
              Forgot password?
            </Link>
          </form>
        </div>
        <p className="text-xs text-center text-orange-200/70 mt-6 font-medium uppercase tracking-wider">
          Authorised access only
        </p>
      </div>
    </div>
  );
};

export default Login;
