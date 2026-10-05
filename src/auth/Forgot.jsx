import { useState } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { UserCheck, Check, Loader2 } from "lucide-react";

const Forgot = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Please enter your username, phone, or email.");
      return;
    }
    setLoading(true);
    try {
      const otp = await invoke("request_password_reset", {
        identifier: identifier.trim().toLowerCase(),
      });
      setDevOtp(otp);
      setSent(true);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not process your request.");
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
            Password Recovery
          </p>
        </div>

        <div className="bg-white border-t-4 border-orange-500 shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-950 border-2 border-orange-500">
                <Check size={28} color="white" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                A 6-digit code has been sent for verification.
              </p>

              {/* DEV ONLY — remove in production */}
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-600 text-left">
                <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider">
                  Dev Mode — OTP
                </p>
                <p className="text-2xl font-bold text-blue-950 tracking-widest text-center mt-1">
                  {devOtp}
                </p>
              </div>

              <Link
                to={`/auth/reset?identifier=${encodeURIComponent(identifier)}`}
                className="inline-block bg-orange-500 text-white px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500"
              >
                Continue to Reset
              </Link>

              <Link to="/auth/login"
                className="block text-center text-xs text-blue-950 hover:text-orange-500 font-bold uppercase tracking-wider">
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              <p className="text-sm text-gray-700 text-center leading-relaxed font-medium">
                Enter your username, phone, or email to receive a reset code.
              </p>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  Username / Phone / Email
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                  <UserCheck size={18} className="text-blue-950 mr-2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                    autoCapitalize="none"
                    className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                    placeholder="Enter identifier"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send Reset Code"}
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

export default Forgot;
