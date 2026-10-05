import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  Store, MapPin, User, Phone, Mail, KeyRound,
  Check, ChevronRight, ChevronLeft, ShieldCheck, Loader2,
  Wifi, WifiOff, AlertTriangle, Handshake, RefreshCw, Lock,
  Eye, EyeOff, Save, CalendarClock
} from "lucide-react";

const Setup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1
  const [accessCode, setAccessCode] = useState("");
  const [accessVerified, setAccessVerified] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);

  // Step 2
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseGenerated, setLicenseGenerated] = useState(false);
  const [plan, setPlan] = useState(null);

  // Step 3-4 shop
  const [shopName, setShopName] = useState("");
  const [shopType, setShopType] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");

  // Step 5 contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step 6 admin
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [savedAdmin, setSavedAdmin] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [shopSaved, setShopSaved] = useState(false);

  // Step 7 done
  const [checking, setChecking] = useState(false);
  const [online, setOnline] = useState(null);

  const steps = ["Access", "License", "Pricing", "Shop", "Contact", "Admin", "Done"];

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  };

  useEffect(() => {
    if (step === 6 && !adminPass) setAdminPass(generateRandomPassword());
  }, [step]);

  const verifyAccess = async () => {
    setError("");
    if (!accessCode.trim()) {
      setError("Please enter your access code.");
      return;
    }
    setAccessLoading(true);
    try {
      const pattern = /^[A-Z0-9]{6,}$/i;
      if (!pattern.test(accessCode.trim())) {
        setError("Invalid access code.");
        return;
      }
      setAccessVerified(true);
    } finally {
      setAccessLoading(false);
    }
  };

  const generateLicense = async () => {
    setError("");
    setLicenseLoading(true);
    try {
      setLicenseKey("ABCD-EFGH-IJKL-MNOP");
      setPlan({
        type: "rent-to-own",
        monthly: 3000,
        months: 12,
        paid: 0,
        currency: "KSH",
      });
      setLicenseGenerated(true);
    } finally {
      setLicenseLoading(false);
    }
  };

  const saveShop = async () => {
    setError("");
    try {
      await invoke("save_shop_config", {
        shopName,
        shopType,
        location,
        ownerName: owner,
        ownerPhone: phone,
        ownerEmail: email,
      });
      setShopSaved(true);
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not save shop.");
      throw e;
    }
  };

  const createAdmin = async () => {
    setError("");
    if (adminPass.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setAdminSaving(true);
    try {
      await invoke("create_user", {
        username: "admin",
        password: adminPass,
        fullName: "Administrator",
        email: email || null,
        phone: phone || null,
        groupId: "grp_admin",
      });
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not create admin user.");
      throw e;
    } finally {
      setAdminSaving(false);
    }
  };

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await fetch("https://api.github.com/zen", { cache: "no-store" });
      setOnline(res.ok);
    } catch {
      setOnline(false);
    } finally {
      setChecking(false);
    }
  };

  const next = async () => {
    setError("");
    if (step === 1 && !accessVerified) {
      setError("Please verify your access code first.");
      return;
    }
    if (step === 2 && !licenseGenerated) {
      setError("Please generate your license key first.");
      return;
    }
    if (step === 4) {
      if (!shopName.trim() || !shopType.trim() || !location.trim() || !owner.trim()) {
        setError("Please fill in all fields.");
        return;
      }
    }
    if (step === 5) {
      if (!phone.trim() || !email.trim()) {
        setError("Please fill in all fields.");
        return;
      }
      try { await saveShop(); } catch { return; }
    }
    if (step === 6) {
      if (!savedAdmin) {
        setError("Please confirm you have saved the credentials.");
        return;
      }
      try { await createAdmin(); } catch { return; }
    }
    if (step === 7) {
      navigate("/dashboard");
      return;
    }
    setStep(step + 1);
  };

  const back = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4 bg-red-600 text-white px-4 py-2.5 flex items-center gap-3 border-l-4 border-red-900">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider">
            Stay connected to the internet during installation
          </p>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Inventory <span className="text-orange-500">Pro</span>
          </h1>
          <p className="text-xs text-orange-200 uppercase tracking-widest mt-2 font-bold">
            First-Time Setup
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
          {steps.map((label, i) => {
            const num = i + 1;
            const active = num === step;
            const done = num < step;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 ${
                    active ? "bg-orange-500 text-white border-orange-500"
                    : done ? "bg-white text-blue-950 border-white"
                    : "bg-transparent text-white/50 border-white/30"
                  }`}>
                    {done ? <Check size={14} /> : num}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${
                    active ? "text-orange-500" : done ? "text-white" : "text-white/40"
                  }`}>{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-1 mb-4 ${done ? "bg-white" : "bg-white/20"}`}></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t-4 border-orange-500 shadow-2xl p-8">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={24} color="white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-950">Access Verification</h2>
                  <p className="text-xs text-gray-600 font-medium">
                    Enter the access code we provided after your purchase request.
                  </p>
                </div>
              </div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
                <KeyRound size={18} className="text-blue-950 mr-2" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Enter access code"
                  className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent tracking-widest"
                  spellCheck="false"
                  autoComplete="off"
                  disabled={accessVerified}
                />
                {accessVerified && <Check size={18} className="text-green-700 ml-2" />}
              </div>
              {!accessVerified && (
                <button
                  type="button" onClick={verifyAccess} disabled={accessLoading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-950 text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-60"
                >
                  {accessLoading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "Verify Access Code"}
                </button>
              )}
              {accessVerified && (
                <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-700">
                  <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Access Verified</p>
                  <p className="text-xs text-gray-700 font-medium mt-1">You are cleared to continue setup.</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={24} color="white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-950">Generate License</h2>
                  <p className="text-xs text-gray-600 font-medium">Your license key will be generated for this installation.</p>
                </div>
              </div>
              {!licenseGenerated && (
                <button
                  type="button" onClick={generateLicense} disabled={licenseLoading}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-60"
                >
                  {licenseLoading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : "Generate License Key"}
                </button>
              )}
              {licenseGenerated && (
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                    Your License Key
                  </label>
                  <div className="flex items-center border-2 border-orange-500 px-3 py-3 bg-orange-50">
                    <KeyRound size={18} className="text-orange-500 mr-2" />
                    <input type="text" value={licenseKey} readOnly
                      className="w-full text-base font-bold text-blue-950 outline-none bg-transparent tracking-widest" />
                    <Check size={18} className="text-green-700 ml-2" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-2">
                    Save this key. You will need it if you reinstall the system.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && plan && (
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-1">Your Plan</h2>
              <p className="text-xs text-gray-600 font-medium mb-5">Confirmed from your purchase request.</p>
              {plan.type === "one-time" && (
                <div className="border-2 border-green-700 bg-green-50 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 mb-3">
                    <Handshake size={32} color="white" />
                  </div>
                  <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Full Ownership</p>
                  <p className="text-3xl font-bold text-blue-950 mt-2">{plan.currency} {plan.totalPaid?.toLocaleString()}</p>
                  <p className="text-xs text-gray-700 font-medium mt-1">Paid in full — this system is yours.</p>
                </div>
              )}
              {plan.type === "rent-to-own" && (
                <div className="border-2 border-orange-500 bg-orange-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <CalendarClock size={24} color="white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-widest">Rent to Own</p>
                      <p className="text-xs text-gray-700 font-medium">Pay monthly until fully owned.</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Row label="Monthly Payment" value={`${plan.currency} ${plan.monthly?.toLocaleString()}`} />
                    <Row label="Duration" value={`${plan.months} months`} />
                    <Row label="Total" value={`${plan.currency} ${(plan.monthly * plan.months).toLocaleString()}`} />
                    <Row label="Paid So Far" value={`${plan.currency} ${plan.paid?.toLocaleString()}`} />
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-white border-2 border-orange-500/30 h-3">
                      <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, (plan.paid / (plan.monthly * plan.months)) * 100)}%` }}></div>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium mt-1 text-right">
                      {Math.round((plan.paid / (plan.monthly * plan.months)) * 100)}% complete
                    </p>
                  </div>
                </div>
              )}
              {plan.type === "subscription" && (
                <div className="border-2 border-blue-950 bg-blue-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-950 flex items-center justify-center flex-shrink-0">
                      <RefreshCw size={24} color="white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-950 uppercase tracking-widest">Subscription</p>
                      <p className="text-xs text-gray-700 font-medium">Ongoing monthly with free maintenance and backups.</p>
                    </div>
                  </div>
                  <div className="text-center py-4 border-t-2 border-blue-950/20">
                    <p className="text-3xl font-bold text-blue-950">{plan.currency} {plan.monthly?.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-1">per month</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-1">Shop Details</h2>
              <p className="text-xs text-gray-600 font-medium mb-5">Tell us about your business.</p>
              <div className="space-y-4">
                <Field icon={Store} label="Shop Name" value={shopName} onChange={setShopName} placeholder="e.g., Jeff Hardware Store" />
                <Field icon={Store} label="Shop Type" value={shopType} onChange={setShopType} placeholder="e.g., Hardware, Retail, Pharmacy" />
                <Field icon={MapPin} label="Location" value={location} onChange={setLocation} placeholder="e.g., Nakuru Town, Kenyatta Avenue" />
                <Field icon={User} label="Owner Name" value={owner} onChange={setOwner} placeholder="e.g., John Doe" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-1">Contact Information</h2>
              <p className="text-xs text-gray-600 font-medium mb-5">For support and renewal notices.</p>
              <div className="space-y-4">
                <Field icon={Phone} label="Phone Number" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" type="tel" />
                <Field icon={Mail} label="Email Address" value={email} onChange={setEmail} placeholder="owner@example.com" type="email" />
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-1">Admin Credentials</h2>
              <p className="text-xs text-gray-600 font-medium mb-5">
                Your login for the system. Username is fixed as <span className="font-bold">admin</span>. Save this password now.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Username</label>
                  <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 bg-gray-100">
                    <User size={18} className="text-blue-950 mr-2" />
                    <input type="text" value="admin" readOnly
                      className="w-full text-sm font-bold text-blue-950 outline-none bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Password</label>
                  <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 bg-gray-50">
                    <Lock size={18} className="text-blue-950 mr-2" />
                    <input type={showPass ? "text" : "password"} value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent tracking-widest" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-blue-950 hover:text-orange-500 ml-2">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button type="button" onClick={() => setAdminPass(generateRandomPassword())}
                      className="text-orange-500 hover:text-orange-600 ml-2" title="Regenerate">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-red-50 border-l-4 border-red-600">
                  <p className="text-xs text-red-800 font-bold uppercase tracking-wider">Save These Now</p>
                  <p className="text-xs text-gray-700 font-medium mt-1">
                    We will not show this password again. Write it down or store it safely.
                  </p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={savedAdmin}
                    onChange={(e) => setSavedAdmin(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500" />
                  <span className="text-xs text-gray-700 font-medium">I have saved my admin credentials.</span>
                </label>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-950 border-2 border-orange-500 mb-4">
                {online === false ? <WifiOff size={28} color="white" /> : <Wifi size={28} color="white" />}
              </div>
              <h2 className="text-lg font-bold text-blue-950 mb-1">Setup Complete</h2>
              <p className="text-xs text-gray-600 font-medium mb-6">We will verify your internet connection now.</p>
              <button type="button" onClick={checkConnection} disabled={checking}
                className="w-full flex items-center justify-center gap-2 bg-blue-950 text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-60"
              >
                {checking ? <><Loader2 size={16} className="animate-spin" /> Checking Connection…</> : <><Wifi size={16} /> Verify Connection</>}
              </button>
              {online === true && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-700 mb-2"><Check size={24} color="white" /></div>
                  <p className="text-sm font-bold text-green-800 uppercase tracking-widest">Connection Verified</p>
                  <p className="text-xs text-gray-700 font-medium mt-1">You are ready to use Inventory Pro.</p>
                </div>
              )}
              {online === false && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-600">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 mb-2"><WifiOff size={24} color="white" /></div>
                  <p className="text-sm font-bold text-red-800 uppercase tracking-widest">No Connection</p>
                  <p className="text-xs text-gray-700 font-medium mt-1">Please reconnect to the internet and try again.</p>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-bold mt-4">{error}</p>}

          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-blue-950/10">
            <button type="button" onClick={back} disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-950 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={next}
              disabled={(step === 7 && online !== true) || adminSaving}
              className="flex items-center gap-1 bg-orange-500 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors border-2 border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {adminSaving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : (step === 7 ? "Enter System" : "Next")}
              {step < 7 && !adminSaving && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">{label}</label>
    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2 focus-within:border-orange-500 bg-gray-50">
      <Icon size={18} className="text-blue-950 mr-2" />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm font-medium text-blue-950 outline-none bg-transparent" spellCheck="false" />
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold text-blue-950 text-right truncate ml-3">{value || "—"}</span>
  </div>
);

export default Setup;
