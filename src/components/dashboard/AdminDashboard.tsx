import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, BedDouble, Activity, AlertOctagon, Receipt, 
  Pill, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Plus, Calendar, Stethoscope, ChevronRight, FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    t, beds, queueTokens, emergencyCases, admissions, 
    invoices, auditLogs, setActiveModule, openPrintDoc 
  } = useApp();

  const totalBeds = beds.length || 35;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const cleaningBeds = beds.filter(b => b.status === 'cleaning_blocked').length;

  const totalTokens = queueTokens.length;
  const waitingTokens = queueTokens.filter(q => q.status === 'waiting').length;
  const completedTokens = queueTokens.filter(q => q.status === 'completed').length;
  const inConsultationTokens = queueTokens.filter(q => q.status === 'in_consultation').length;

  const activeEmergencies = emergencyCases.filter(e => e.status === 'active');
  
  // Financial calculation
  const totalCollections = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
              Operations Control Center
            </span>
            <span className="text-xs text-slate-300">Phase 1 Connected Baseline</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Swastik Hospital Management System</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Single site • 35 Inpatient Beds • 25–50 OPD daily volume • 1 OT Suite • In-house Radiology & Configurable Lab
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModule('registration')}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => setActiveModule('opd')}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition"
          >
            <Stethoscope className="w-4 h-4 text-teal-300" />
            <span>OPD Queue</span>
          </button>
          <button
            onClick={() => setActiveModule('emergency')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Emergency</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. OPD Planning & Queue */}
        <div 
          onClick={() => setActiveModule('opd')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OPD Planning Volume</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalTokens}</span>
            <span className="text-xs text-slate-500">tokens today</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span className="text-amber-600 font-semibold">{waitingTokens} waiting</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">{inConsultationTokens} consulting</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{completedTokens} done</span>
          </div>
        </div>

        {/* 2. Inpatient Beds */}
        <div 
          onClick={() => setActiveModule('ipd')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inpatient Bed Matrix</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{occupiedBeds} / {totalBeds}</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              {Math.round((occupiedBeds / totalBeds) * 100)}% Occ
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span className="text-emerald-600 font-semibold">{availableBeds} available</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{cleaningBeds} cleaning</span>
          </div>
        </div>

        {/* 3. Emergency Triage */}
        <div 
          onClick={() => setActiveModule('emergency')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Triage</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition ${activeEmergencies.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">{activeEmergencies.length}</span>
            <span className="text-xs text-slate-500">active urgent cases</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {activeEmergencies.some(e => e.triage === 'red') ? (
              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                1 RED Immediate Priority
              </span>
            ) : (
              <span className="text-slate-500">Triage protocol synchronized</span>
            )}
          </div>
        </div>

        {/* 4. Billing Collections */}
        <div 
          onClick={() => setActiveModule('billing')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Collections</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">₹{totalCollections.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Collected</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <span className="text-rose-600 font-semibold">₹{totalOutstanding.toLocaleString('en-IN')} outstanding</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Doctor Clinics & Live Operation Theatre Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doctors OPD Schedule & Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Clinician OPD Consultations Today</h3>
                <p className="text-xs text-slate-500">Doctor-specific token queues and specialty templates</p>
              </div>
              <button 
                onClick={() => setActiveModule('opd')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Launch OPD Queue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doctor 1: Dr. Vandana Jain */}
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Dr. Vandana Jain</h4>
                    <p className="text-xs text-teal-800 font-medium">Gynecology & Obstetrics</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                    In Clinic
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-teal-100 flex justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Token:</span>
                    <span className="font-bold text-teal-900 text-sm">Token #01</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient:</span>
                    <span className="font-semibold text-slate-800">Sunita Aggarwal</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status:</span>
                    <span className="font-bold text-emerald-600">In Consult</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>Specialty Template: <b className="text-slate-800">Obstetric Antenatal</b></span>
                  <span>Queue: <b className="text-teal-800">3 waiting</b></span>
                </div>
              </div>

              {/* Doctor 2: Dr. Ankit Jain */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Dr. Ankit Jain</h4>
                    <p className="text-xs text-indigo-800 font-medium">Anesthesia & Critical Care</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                    Available / PAC
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 flex justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Token:</span>
                    <span className="font-bold text-indigo-900 text-sm">Token #01</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient:</span>
                    <span className="font-semibold text-slate-800">Rajendra Singh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status:</span>
                    <span className="font-bold text-slate-500">Completed</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>Specialty Template: <b className="text-slate-800">PAC & Airway Mallampati</b></span>
                  <span>OT Case: <b className="text-indigo-800">1:00 PM LSCS</b></span>
                </div>
              </div>

            </div>
          </div>

          {/* Operation Theatre 1 Today's Schedule */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Operation Theatre 1 (Main OT) Schedule</h3>
                <p className="text-xs text-slate-500">Single OT conflict-checked surgical timeline</p>
              </div>
              <button 
                onClick={() => setActiveModule('ot')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>OT Manager</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1.5 rounded-lg bg-teal-100 text-teal-800 font-mono font-bold text-center">
                    13:00 - 14:30
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Elective Lower Segment Caesarean Section (LSCS)</p>
                    <p className="text-slate-500 text-xs">Patient: Sunita Aggarwal (SH-2026-00101) • Spinal Anesthesia</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right sm:block">
                    <p className="font-semibold text-slate-800">Dr. Vandana Jain (Surgeon)</p>
                    <p className="text-slate-500 text-[11px]">Dr. Ankit Jain (Anesthesia)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Scheduled
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold text-center">
                    15:00 - 17:00
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Total Laparoscopic Hysterectomy (TLH)</p>
                    <p className="text-slate-500 text-xs">Patient: Meena Kumari (SH-2026-00105)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right sm:block">
                    <p className="font-semibold text-slate-800">Dr. Vandana Jain (Surgeon)</p>
                    <p className="text-slate-500 text-[11px]">Dr. Ankit Jain (PAC Pending)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                    Planned
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Trail & Alerts */}
        <div className="space-y-4">
          
          {/* Pharmacy & Stock Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-amber-600" />
                <span>Pharmacy Alerts</span>
              </h3>
              <button 
                onClick={() => setActiveModule('pharmacy')}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
              >
                View Stock
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">IV Cannula 20G Pink</p>
                  <p className="text-[11px] text-rose-700">Stock: 9 units left (Reorder level: 50)</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Augmentin 625mg (Batch AUG-23X09)</p>
                  <p className="text-[11px] text-amber-700">Expiring in Nov 2026 (25 strips)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Audit Trail */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Traceable Audit Log</span>
              </h3>
              <button 
                onClick={() => setActiveModule('audit')}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
              >
                All Logs
              </button>
            </div>
            <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{log.operatorName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-500 leading-snug">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
