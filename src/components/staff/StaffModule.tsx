import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import { Users, ShieldCheck, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const StaffModule: React.FC = () => {
  const { availableUsers, currentUser, switchUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'directory' | 'roster' | 'permissions'>('directory');

  const shifts = [
    { name: 'Dr. Vandana Jain', role: 'Gynecologist', shift: 'Morning Clinic (09:00 - 15:00)', department: 'OPD / OT' },
    { name: 'Dr. Ankit Jain', role: 'Anesthesiologist', shift: 'Full Day & OT On-Call (08:30 - 17:30)', department: 'OT / Critical Care' },
    { name: 'Sister Sunita Patel', role: 'Head Nurse', shift: 'Morning Shift (07:30 - 15:30)', department: 'IPD Nursing' },
    { name: 'Priya Sharma', role: 'Receptionist', shift: 'Morning Shift (08:00 - 16:00)', department: 'Front Desk' },
    { name: 'Rajesh Kumar', role: 'Lab Tech', shift: 'General Shift (08:00 - 16:30)', department: 'Pathology' },
    { name: 'Amit Shah', role: 'Pharmacist', shift: 'General Shift (09:00 - 18:00)', department: 'Pharmacy' },
    { name: 'Neha Mehra', role: 'Cashier', shift: 'Morning Shift (08:30 - 16:30)', department: 'Billing' },
    { name: 'Ramesh Verma', role: 'OT Coordinator', shift: 'OT Schedule (08:00 - 16:00)', department: 'Operation Theatre' },
  ];

  const permissionsMatrix = [
    { module: 'Patient Registration & UHID', reception: true, doctor: true, nurse: true, billing: true, admin: true },
    { module: 'Clinical OPD Notes & Rx', reception: false, doctor: true, nurse: false, billing: false, admin: true },
    { module: 'Inpatient Bed Admission / Transfer', reception: true, doctor: true, nurse: true, billing: false, admin: true },
    { module: 'Medication Administration (MAR)', reception: false, doctor: true, nurse: true, billing: false, admin: true },
    { module: 'Clinical Discharge Authorization', reception: false, doctor: true, nurse: false, billing: false, admin: true },
    { module: 'OT Surgery Booking & Conflicts', reception: false, doctor: true, nurse: false, billing: false, admin: true },
    { module: 'Radiology PACS Report Release', reception: false, doctor: false, nurse: false, billing: false, admin: true, specialist: 'Radiologist Only' },
    { module: 'Pathology Lab Results Release', reception: false, doctor: false, nurse: false, billing: false, admin: true, specialist: 'Pathologist Only' },
    { module: 'Pharmacy Batch Dispensing', reception: false, doctor: false, nurse: false, billing: false, admin: true, specialist: 'Pharmacist Only' },
    { module: 'Financial Refunds & Discounts', reception: false, doctor: false, nurse: false, billing: false, admin: true, specialist: 'Finance Head / Admin Only' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Staff Administration, Duty Roster & Role RBAC</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            11–25 individual staff accounts • No shared logins policy • Module-action level permissions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          {[
            { id: 'directory', label: 'Staff Accounts (12)' },
            { id: 'roster', label: 'Duty Shifts Roster' },
            { id: 'permissions', label: 'Permission Matrix' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900">Individual Staff Accounts ({availableUsers.length})</h3>
            <span className="text-xs text-slate-500">MFA & Controlled Sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role Code</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-center">MFA Status</th>
                  <th className="p-3 text-right">Switch Active Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableUsers.map(user => {
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 transition ${isCurrent ? 'bg-teal-50/40 font-semibold' : ''}`}>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </td>
                      <td className="p-3 text-slate-700">{user.department}</td>
                      <td className="p-3 font-mono uppercase text-teal-800 text-[10px] font-bold">
                        {user.role}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{user.mobile}</td>
                      <td className="p-3 text-center">
                        {user.mfaEnabled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            MFA Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded bg-teal-700 text-white text-[11px] font-bold">
                            Active User
                          </span>
                        ) : (
                          <button
                            onClick={() => switchUser(user)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-bold transition shadow-sm"
                          >
                            Switch To User
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster Tab */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Hospital Duty Shifts & Rosters</h3>
              <p className="text-xs text-slate-500">Current active clinical & front desk shift assignments</p>
            </div>
            <button
              onClick={() => showToast('Attendance recorded for your active account!', 'success')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark My Attendance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shifts.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                  <p className="text-[11px] text-teal-800 font-semibold">{s.role} • {s.department}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.shift}</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  On Duty
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900">Role-Based Action Permission Matrix (RBAC)</h3>
            <p className="text-xs text-slate-500">Strict segregation of duties enforced across the hospital system</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Hospital Module / Workflow</th>
                  <th className="p-3 text-center">Reception</th>
                  <th className="p-3 text-center">Doctor</th>
                  <th className="p-3 text-center">Nursing</th>
                  <th className="p-3 text-center">Billing</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3">Specialist Restriction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((pm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{pm.module}</td>
                    <td className="p-3 text-center">{pm.reception ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{pm.doctor ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{pm.nurse ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{pm.billing ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{pm.admin ? '✅' : '❌'}</td>
                    <td className="p-3 text-[11px] font-semibold text-purple-700">{pm.specialist || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
