import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Languages, WifiOff, Wifi, AlertTriangle, 
  BedDouble, Users, UserCheck, ShieldCheck, ChevronDown, 
  ExternalLink, Printer, Bell, LogOut, LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    language, setLanguage, t, currentUser, isAuthenticated, logout,
    availableUsers, isDowntimeMode, setDowntimeMode, 
    beds, queueTokens, emergencyCases, activeModule, setActiveModule,
    showToast
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Stats calculations
  const totalBeds = beds.length || 35;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const activeEmergencies = emergencyCases.filter(e => e.status === 'active').length;
  const activeQueue = queueTokens.filter(q => ['waiting', 'called', 'in_consultation'].includes(q.status)).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top emergency / outage notification bar if active */}
      {isDowntimeMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>OUTAGE DOWNTIME MODE ACTIVE: Cloud connectivity interrupted. Use manual offline entry. Transactions stored locally for post-restoration audit reconciliation.</span>
          </div>
          <button 
            onClick={() => setDowntimeMode(false)}
            className="bg-black text-white px-2 py-0.5 rounded text-xs hover:bg-slate-800 transition"
          >
            Restore Live Mode
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Hospital Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                {t.hospitalName}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-800 border border-teal-200 rounded">
                NABH Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Bed Occupancy Quick Pill */}
          <div 
            onClick={() => setActiveModule('ipd')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium cursor-pointer transition"
            title="Click to view IPD Bed Grid"
          >
            <BedDouble className="w-4 h-4 text-teal-600" />
            <span>{t.bedOccupancy}:</span>
            <span className="font-bold text-slate-800">{occupiedBeds}/{totalBeds}</span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-100 font-semibold">
              {Math.round((occupiedBeds / totalBeds) * 100)}%
            </span>
          </div>

          {/* OPD Queue Today Quick Pill */}
          <div 
            onClick={() => setActiveModule('opd')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium cursor-pointer transition"
            title="Click to view OPD Token Queue"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{t.opdToday}:</span>
            <span className="font-bold text-indigo-900">{activeQueue} active</span>
          </div>

          {/* Emergency Pill */}
          <div 
            onClick={() => setActiveModule('emergency')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
              activeEmergencies > 0 
                ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' 
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Click to view Emergency Triage"
          >
            <AlertTriangle className={`w-4 h-4 ${activeEmergencies > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>{t.emergencyAlerts}:</span>
            <span className="font-bold">{activeEmergencies}</span>
          </div>
        </div>

        {/* Controls: Language, Downtime, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Outage Toggle */}
          <button
            onClick={() => setDowntimeMode(!isDowntimeMode)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isDowntimeMode 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={isDowntimeMode ? "Switch to Live Cloud Mode" : "Simulate Cloud/Internet Outage (Downtime Mode)"}
          >
            {isDowntimeMode ? <WifiOff className="w-4 h-4 text-amber-700" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            <span className="hidden xl:inline">{isDowntimeMode ? 'Offline Mode' : 'Online'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-4 h-4 text-teal-600" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Patient Portal Direct Shortcut */}
          <button
            onClick={() => setActiveModule('patient_portal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              activeModule === 'patient_portal'
                ? 'bg-teal-700 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.patientPortal}</span>
            <span className="sm:hidden">Portal</span>
          </button>

          {/* Authenticated Staff Badge & Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div className="text-left hidden sm:block">
                  <p className="font-bold leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-300 mt-0.5 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                title="Sign Out of Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModule('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-sm transition"
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
