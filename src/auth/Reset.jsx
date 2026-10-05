import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Lock, Eye, EyeOff, Check, KeyRound, Loader2 } from "lucide-react";

const Reset = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const identifier = params.get("identifier") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await invoke("verify_reset_otp", {
        identifier: identifier.toLowerCase(),
        otp: otp.trim(),
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate("/auth/login", { replace: true }), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Inventory <span className="text-orange-500">Pro</span>
          </h1>
          <p className="text-xs text-orange-200 uppercase tracking-widest mt-2 font-bold">
            Reset Password
          </p>
        </div>

        <div className="bg-white border-t-4 border-orange-500 shadow-2xl p-8">
          {done ? (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-950 border-2 border-orange-500">
                <Check size={28} color="white" />
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Password reset successfully. Redirecting to login…
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              {!identifier && (
                <p className="text-xs text-red-600 font-bold text-center">
                  Missing identifier. <Link to="/auth/forgot" className="underline">Start again</Link>
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  6-Digit Code
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                  <KeyRound size={18} className="text-blue-950 mr-2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-lg font-bold text-blue-950 outline-none bg-transparent tracking-widest text-center"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                  <Lock size={18} className="text-blue-950 mr-2" />
                  <input type={showPass ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                    placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="text-blue-950 hover:text-orange-500 ml-2">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                  <Lock size={18} className="text-blue-950 mr-2" />
                  <input type={showConfirm ? "text" : "password"} value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                    placeholder="Repeat password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="text-blue-950 hover:text-orange-500 ml-2">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Set New Password"}
              </button>

              <Link to="/auth/login"
                className="block text-center text-xs text-blue-950 hover:text-orange-500 font-bold uppercase tracking-wider">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reset;
