import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Search, Filter, Lock } from 'lucide-react';

export const AuditModule: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'all' || log.module.toLowerCase().includes(selectedModule.toLowerCase());

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            <span>Traceable Audit Log & ICT Security Compliance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable timestamps • Operator accountability • CERT-In & DPDP readiness • Clinical & financial logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 w-48"
          />

          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
          >
            <option value="all">All Modules</option>
            <option value="Registration">Registration</option>
            <option value="OPD">OPD</option>
            <option value="IPD">IPD Ward</option>
            <option value="Emergency">Emergency</option>
            <option value="Operation Theatre">Operation Theatre</option>
            <option value="Radiology">Radiology</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Central Billing">Central Billing</option>
            <option value="Outage Mode">Outage Mode</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-900">Security & Operational Activity Trail ({filteredLogs.length})</h3>
          <span className="text-xs text-slate-500 font-mono">180-Day Secure Rolling Audit Retention</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp (ISO)</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Module</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Record ID</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.id}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.operatorName}</td>
                  <td className="p-3 font-semibold text-teal-800">{log.module}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-700">{log.recordId}</td>
                  <td className="p-3 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
