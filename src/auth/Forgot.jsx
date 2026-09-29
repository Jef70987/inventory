import { useState } from "react";
import { Link } from "react-router-dom";
import { UserCheck, Check } from "lucide-react";

const Forgot = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Please enter your ID number, phone, or employee ID.");
      return;
    }
    setLoading(true);
    try {
      setMaskedEmail("jo****oe@ex***le.com");
      setSent(true);
    } catch (err) {
      setError("Could not verify the provided ID.");
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
                A password reset link has been sent to your registered email:
              </p>
              <p className="text-sm font-bold text-blue-950 bg-gray-50 border-2 border-blue-950/10 py-2">
                {maskedEmail}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                The link expires shortly. Check your inbox and spam folder.
              </p>
              <Link
                to="/auth/login"
                className="inline-block bg-blue-950 text-white px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors border-2 border-blue-950"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              <p className="text-sm text-gray-700 text-center leading-relaxed font-medium">
                Enter your ID number, phone number, or employee ID to verify your account. A reset link will be sent to the email associated with it.
              </p>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  ID / Phone / Employee ID
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                  <UserCheck size={18} className="text-blue-950 mr-2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent"
                    placeholder="Enter your ID, phone, or employee ID"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-bold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & Send Reset Link"}
              </button>

              <Link
                to="/auth/login"
                className="block text-center text-xs text-blue-950 hover:text-orange-500 font-bold uppercase tracking-wider"
              >
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
