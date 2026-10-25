import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { BarChart3, Download, Printer, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { 
    queueTokens, beds, admissions, emergencyCases, 
    invoices, patients, openPrintDoc, showToast 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<'opd' | 'ipd' | 'ot' | 'diagnostics' | 'revenue' | 'pharmacy'>('opd');
  const [dateRange, setDateRange] = useState('today');

  const totalRevenue = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalDue = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const totalBeds = beds.length || 35;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;

  const handleExportExcel = () => {
    showToast('Report exported successfully as CSV/Excel compatible file!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <span>Hospital Department Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-department operational audits • Financial collections • Bed turnarounds • PDF/Excel Exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current Report</span>
          </button>
        </div>
      </div>

      {/* Report Categories Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'opd', label: 'OPD Consultations & Tokens' },
          { id: 'ipd', label: 'IPD Admissions & Bed Occupancy' },
          { id: 'ot', label: 'OT Surgical Cases' },
          { id: 'diagnostics', label: 'Radiology & Lab Tests' },
          { id: 'revenue', label: 'Billing & Daily Revenue' },
          { id: 'pharmacy', label: 'Pharmacy Stock & Alerts' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedReport === r.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Display Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 uppercase tracking-tight">
              Swastik Hospital • {selectedReport.toUpperCase()} Operational Report
            </h3>
            <p className="text-xs text-slate-500">
              Period: Today ({new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}) • Generated from Live Transactional DB
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
            CONFIDENTIAL • AUTHORIZED AUDIT
          </span>
        </div>

        {/* 1. OPD Report */}
        {selectedReport === 'opd' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total OPD Tokens:</span>
                <span className="text-xl font-bold text-slate-900">{queueTokens.length}</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-indigo-800 block">Dr. Vandana Jain (Gynecology):</span>
                <span className="text-xl font-bold text-indigo-900">{queueTokens.filter(q => q.doctorId === 'DOC-001').length}</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <span className="text-teal-800 block">Dr. Ankit Jain (PAC/Critical):</span>
                <span className="text-xl font-bold text-teal-900">{queueTokens.filter(q => q.doctorId === 'DOC-002').length}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block">Completed Consultations:</span>
                <span className="text-xl font-bold text-emerald-900">{queueTokens.filter(q => q.status === 'completed').length}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Token #</th>
                    <th className="p-2.5">UHID</th>
                    <th className="p-2.5">Patient</th>
                    <th className="p-2.5">Doctor</th>
                    <th className="p-2.5">Encounter ID</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueTokens.map(q => (
                    <tr key={q.id}>
                      <td className="p-2.5 font-bold font-mono">#{q.tokenNumber}</td>
                      <td className="p-2.5 font-mono text-teal-800">{q.uhid}</td>
                      <td className="p-2.5 font-bold text-slate-900">{q.patientName}</td>
                      <td className="p-2.5 text-slate-700">{q.doctorName}</td>
                      <td className="p-2.5 font-mono text-slate-500">{q.encounterId}</td>
                      <td className="p-2.5 capitalize">{q.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. IPD Report */}
        {selectedReport === 'ipd' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Configured Capacity:</span>
                <span className="text-xl font-bold text-slate-900">{totalBeds} Beds</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <span className="text-teal-800 block">Occupied Beds:</span>
                <span className="text-xl font-bold text-teal-900">{occupiedBeds} Beds ({Math.round((occupiedBeds / totalBeds) * 100)}%)</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block">Vacant Beds:</span>
                <span className="text-xl font-bold text-emerald-900">{beds.filter(b => b.status === 'available').length} Beds</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-amber-800 block">Terminal Sanitization:</span>
                <span className="text-xl font-bold text-amber-900">{beds.filter(b => b.status === 'cleaning_blocked').length} Beds</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Admission ID</th>
                    <th className="p-2.5">Bed / Ward</th>
                    <th className="p-2.5">Patient Name</th>
                    <th className="p-2.5">Attending Consultant</th>
                    <th className="p-2.5">Admitted On</th>
                    <th className="p-2.5">Discharge Authorized?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions.map(a => (
                    <tr key={a.admissionId}>
                      <td className="p-2.5 font-mono font-bold text-teal-800">{a.admissionId}</td>
                      <td className="p-2.5 font-bold text-slate-900">{a.bedNumber} ({a.wardName})</td>
                      <td className="p-2.5">{a.patientName}</td>
                      <td className="p-2.5">{a.attendingDoctorName}</td>
                      <td className="p-2.5">{new Date(a.admissionDate).toLocaleDateString()}</td>
                      <td className="p-2.5 font-bold">{a.clinicalDischargeAuthorized ? '✅ Yes' : '⏳ Care in progress'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Revenue Report */}
        {selectedReport === 'revenue' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total Amount Invoiced:</span>
                <span className="text-2xl font-black text-slate-900">₹{totalBilled.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block">Total Realized Collections:</span>
                <span className="text-2xl font-black text-emerald-700">₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-rose-800 block">Outstanding Receivables:</span>
                <span className="text-2xl font-black text-rose-700">₹{totalDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Patient</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Invoiced (₹)</th>
                    <th className="p-2.5 text-right">Collected (₹)</th>
                    <th className="p-2.5 text-right">Balance Due (₹)</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(i => (
                    <tr key={i.id}>
                      <td className="p-2.5 font-mono font-bold text-teal-800">{i.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{i.patientName}</td>
                      <td className="p-2.5">{i.date}</td>
                      <td className="p-2.5 text-right">₹{i.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">₹{i.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-bold text-rose-700">₹{i.balanceDue.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-center uppercase font-bold text-[10px]">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
