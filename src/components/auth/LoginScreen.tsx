import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { 
  Building2, ShieldCheck, Lock, Mail, Key, ArrowRight, 
  AlertCircle, CheckCircle2, UserCheck, HeartPulse, Smartphone, Loader2
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setCurrentUser, setActiveModule, showToast } = useApp();
  const [email, setEmail] = useState('admin@swastikhospital.in');
  const [password, setPassword] = useState('Swastik@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickRoles = [
    { label: 'Administrator', email: 'admin@swastikhospital.in', role: 'admin', desc: 'Hospital Superintendent' },
    { label: 'Dr. Vandana Jain', email: 'vandana.jain@swastikhospital.in', role: 'doctor_gynecologist', desc: 'Gynecology & Obstetrics' },
    { label: 'Dr. Ankit Jain', email: 'ankit.jain@swastikhospital.in', role: 'doctor_anesthesiologist', desc: 'Anesthesiology & OT' },
    { label: 'Sister Sunita', email: 'nursing@swastikhospital.in', role: 'nurse', desc: 'Inpatient Ward Nursing' },
    { label: 'Central Billing', email: 'billing@swastikhospital.in', role: 'billing_cashier', desc: 'Cashier & Invoicing' },
    { label: 'Reception', email: 'reception@swastikhospital.in', role: 'reception', desc: 'Front Desk & Tokens' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await ApiService.staffLogin(email, password);
      setCurrentUser(res.user);
      showToast(`Welcome, ${res.user.name}! Authenticated as ${res.user.role}.`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 p-6 sm:p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <HeartPulse className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Swastik Hospital</h1>
          <p className="text-xs text-emerald-300 font-medium mt-1">
            Hospital Management System • स्वस्तिक अस्पताल प्रबंधन
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP & CERT-In Compliant Gateway</span>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800">Authorized Clinical & Staff Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter hospital credentials to access your departmental console
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swastikhospital.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400 font-mono">Default: Swastik@2026</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-teal-900/20 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Selection for Evaluation */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Role Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {quickRoles.map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => { setEmail(r.email); setPassword('Swastik@2026'); }}
                  className={`text-left p-2 rounded-lg border text-xs transition ${
                    email === r.email 
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-bold' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="truncate font-semibold">{r.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Portal Switcher */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Are you a patient seeking consultation?</p>
            <button
              type="button"
              onClick={() => {
                setActiveModule('patient_portal');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Go to Patient Portal (WhatsApp OTP Login)</span>
            </button>
          </div>

        </div>

      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        Swastik Hospital Management System • Single Site 35-Bed Facility • Server Authenticated
      </footer>
    </div>
  );
};
