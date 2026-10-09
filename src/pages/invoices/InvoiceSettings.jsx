import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Info, Upload
} from "lucide-react";

const InvoiceSettings = () => {
  const [settings, setSettings] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    company_website: "",
    logo_path: "",
    currency: "KES",
    payment_terms: "",
    footer_text: "",
  });
  const [nextNumber, setNextNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await invoke("get_invoice_settings");
        setSettings({
          company_name: s.company_name || "",
          company_address: s.company_address || "",
          company_phone: s.company_phone || "",
          company_email: s.company_email || "",
          company_website: s.company_website || "",
          logo_path: s.logo_path || "",
          currency: s.currency || "KES",
          payment_terms: s.payment_terms || "",
          footer_text: s.footer_text || "",
        });
        setNextNumber(s.next_number || 1);
      } catch (e) {
        setError(typeof e === "string" ? e : "Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      await invoke("save_invoice_settings", {
        companyName: settings.company_name || null,
        companyAddress: settings.company_address || null,
        companyPhone: settings.company_phone || null,
        companyEmail: settings.company_email || null,
        companyWebsite: settings.company_website || null,
        logoPath: settings.logo_path || null,
        currency: settings.currency,
        paymentTerms: settings.payment_terms || null,
        footerText: settings.footer_text || null,
      });
      setSuccess("Settings saved.");
      setTimeout(() => setSuccess(""), 1500);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-blue-950" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950">Invoice Settings</h1>
          <p className="text-gray-600 font-medium text-xs sm:text-sm">Company info shown on invoices</p>
        </div>
        <Link to="/invoices/all">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold hover:bg-gray-50 text-xs sm:text-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <p className="text-xs text-red-800 font-bold">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-800 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-800 mt-0.5" />
          <p className="text-xs text-green-800 font-bold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Company Name</label>
                <input type="text" name="company_name" value={settings.company_name} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
                <input type="text" name="company_address" value={settings.company_address} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <input type="text" name="company_phone" value={settings.company_phone} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <input type="email" name="company_email" value={settings.company_email} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Website</label>
                <input type="text" name="company_website" value={settings.company_website} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Currency</label>
                <input type="text" name="currency" value={settings.currency} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Next Invoice Number</label>
                <input type="text" value={`INV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, "0")}`} readOnly
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-gray-500 outline-none bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Payment Terms</label>
                <input type="text" name="payment_terms" value={settings.payment_terms} onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="e.g., Net 14 days" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Footer Text</label>
                <textarea name="footer_text" value={settings.footer_text} onChange={handleChange} rows="2"
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="e.g., Thank you for your business!"></textarea>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-950 flex items-start gap-2">
              <Info size={16} className="text-blue-950 mt-0.5" />
              <p className="text-xs text-blue-950 font-medium">
                These details appear at the top and bottom of every invoice you create.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm">
            <button type="submit" disabled={saving}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Save Settings</>}
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 border-2 border-blue-950/10 shadow-sm sticky top-4">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Preview</h2>
            <div className="border-2 border-blue-950/10 p-4">
              <div className="text-center border-b-2 border-blue-950/10 pb-3 mb-3">
                {settings.logo_path ? (
                  <img src={settings.logo_path} alt="Logo"
                    className="w-12 h-12 mx-auto object-cover border-2 border-blue-950/10 mb-2" />
                ) : (
                  <div className="w-12 h-12 mx-auto bg-blue-950 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">{(settings.company_name || "IP").slice(0,1)}</span>
                  </div>
                )}
                <p className="font-bold text-blue-950 text-sm">{settings.company_name || "Your Company"}</p>
                <p className="text-xs text-gray-600">{settings.company_address || "Address"}</p>
                <p className="text-xs text-gray-600">
                  {settings.company_phone || "Phone"} | {settings.company_email || "Email"}
                </p>
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-blue-950">
                    Invoice #: INV-{new Date().getFullYear()}-{String(nextNumber).padStart(4, "0")}
                  </p>
                  <p className="text-gray-600">Date: {new Date().toISOString().slice(0,10)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-950">Total: {settings.currency || "KES"} 0.00</p>
                  <p className="text-gray-600">Status: Pending</p>
                </div>
              </div>
              <div className="border-t-2 border-blue-950/10 mt-3 pt-3 text-center">
                <p className="text-xs text-gray-600">{settings.footer_text || "Footer text"}</p>
                <p className="text-xs text-gray-500 mt-1">{settings.payment_terms || "Payment terms"}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceSettings;
