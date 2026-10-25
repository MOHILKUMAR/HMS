import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Languages, WifiOff, Wifi, AlertTriangle, 
  BedDouble, Users, ShieldCheck, ExternalLink, LogOut, LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    language, setLanguage, t, currentUser, isAuthenticated, logout,
    isDowntimeMode, setDowntimeMode, 
    beds, queueTokens, emergencyCases, activeModule, setActiveModule
  } = useApp();

  // Stats calculations
  const totalBeds = beds.length || 35;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const activeEmergencies = emergencyCases.filter(e => e.status === 'active').length;
  const activeQueue = queueTokens.filter(q => ['waiting', 'called', 'in_consultation'].includes(q.status)).length;
  const occupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top emergency / outage notification bar if active */}
      {isDowntimeMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>OUTAGE DOWNTIME MODE ACTIVE: Cloud connectivity interrupted. Use manual offline entry. Transactions stored locally for post-restoration audit reconciliation.</span>
          </div>
          <button 
            onClick={() => setDowntimeMode(false)}
            className="bg-black text-white px-2.5 py-0.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            Restore Live Mode
          </button>
        </div>
      )}

      {/* Main Header Container - Increased height & refined composition */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Hospital Branding & Identity */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group shrink-0" 
          onClick={() => setActiveModule('dashboard')}
          title="Return to Main Dashboard"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none group-hover:text-teal-800 transition-colors">
                {t.hospitalName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-extrabold tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80 rounded-md">
                NABH Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block mt-1">
              {t.tagline} • 35-Bed Multi-Specialty Facility
            </p>
          </div>
        </div>

        {/* Center: Live Clinical Pulse Command Strip */}
        <div className="hidden xl:flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner">
          {/* Bed Occupancy Quick Pill */}
          <div 
            onClick={() => setActiveModule('ipd')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer transition hover:border-teal-300"
            title="Click to view IPD Bed Grid"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <BedDouble className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Beds</span>
              <span className="font-extrabold text-slate-800 text-xs leading-tight">{occupiedBeds}/{totalBeds}</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
              occupancyPercent > 80 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {occupancyPercent}%
            </span>
          </div>

          {/* OPD Queue Today Quick Pill */}
          <div 
            onClick={() => setActiveModule('opd')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer transition hover:border-indigo-300"
            title="Click to view OPD Token Queue"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">OPD Queue</span>
              <span className="font-extrabold text-indigo-950 text-xs leading-tight">{activeQueue} Active</span>
            </div>
          </div>

          {/* Emergency Pill */}
          <div 
            onClick={() => setActiveModule('emergency')}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition shadow-sm ${
              activeEmergencies > 0 
                ? 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-rose-200'
            }`}
            title="Click to view Emergency Triage"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeEmergencies > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Triage</span>
              <span className="font-extrabold text-xs leading-tight">
                {activeEmergencies > 0 ? `${activeEmergencies} Red/Yellow` : 'All Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Authenticated User Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Outage Simulation Toggle */}
          <button
            onClick={() => setDowntimeMode(!isDowntimeMode)}
            className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
              isDowntimeMode 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
            title={isDowntimeMode ? "Switch to Live Cloud Mode" : "Simulate Cloud/Internet Outage (Downtime Mode)"}
          >
            {isDowntimeMode ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className="hidden md:inline">{isDowntimeMode ? 'Offline Register' : 'Cloud Sync'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="h-10 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Patient Portal Direct Shortcut */}
          <button
            onClick={() => setActiveModule('patient_portal')}
            className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              activeModule === 'patient_portal'
                ? 'bg-teal-800 text-white shadow-teal-900/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-800/15'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.patientPortal}</span>
            <span className="sm:hidden">Portal</span>
          </button>

          {/* Authenticated Staff Badge & Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
              <div className="h-10 flex items-center gap-2.5 px-3.5 rounded-xl bg-slate-900 text-white text-xs shadow-md shadow-slate-900/10">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div className="text-left hidden md:block">
                  <p className="font-bold text-xs leading-none tracking-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-300 font-semibold mt-0.5 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/90 transition shadow-sm"
                title="Sign Out of Console"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModule('dashboard')}
              className="h-10 flex items-center gap-1.5 px-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
