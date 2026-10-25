import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { OtBooking, OtCaseStatus } from '../../types';
import { 
  Activity, Calendar, Clock, AlertTriangle, CheckCircle2, 
  Plus, Users, UserCheck, ShieldCheck, Play, X
} from 'lucide-react';

export const OtModule: React.FC = () => {
  const { refreshData, showToast, patients, currentUser } = useApp();

  const [otBookings, setOtBookings] = useState<OtBooking[]>(StorageService.getOtBookings());
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Form state
  const [patientUhid, setPatientUhid] = useState('SH-2026-00101');
  const [procedureName, setProcedureName] = useState('Elective Lower Segment Caesarean Section (LSCS)');
  const [bookingDate, setBookingDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [surgeonId, setSurgeonId] = useState('DOC-001');
  const [requiresAnesthesia, setRequiresAnesthesia] = useState(true);
  const [anesthesiologistId, setAnesthesiologistId] = useState('DOC-002');
  const [notes, setNotes] = useState('Consent signed. Blood arrangement verified.');

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const checkConflictRealtime = (sTime: string, eTime: string, surgId: string, anesId?: string) => {
    const res = StorageService.checkOtConflict(bookingDate, sTime, eTime, surgId, requiresAnesthesia ? anesId : undefined);
    if (res.hasConflict) {
      setConflictWarning(res.reason || 'Scheduling conflict detected!');
    } else {
      setConflictWarning(null);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.uhid === patientUhid);
    if (!patient) return;

    try {
      const surgeonName = surgeonId === 'DOC-001' ? 'Dr. Vandana Jain' : 'Dr. Devendra Swastik';
      const anesName = requiresAnesthesia ? (anesthesiologistId === 'DOC-002' ? 'Dr. Ankit Jain' : 'External Anesthetist') : undefined;

      const newBooking = StorageService.bookOtCase({
        theatreName: 'Operation Theatre 1 (Main OT)',
        uhid: patient.uhid,
        patientName: patient.name,
        procedureName,
        date: bookingDate,
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes),
        surgeonId,
        surgeonName,
        anesthesiologistId: requiresAnesthesia ? anesthesiologistId : undefined,
        anesthesiologistName: anesName,
        assistantStaff: ['Sister Sunita Patel', 'Ramesh Verma (OT Tech)'],
        requiresAnesthesia,
        preOpChecked: true,
        status: 'scheduled',
        notes
      });

      setOtBookings(StorageService.getOtBookings());
      refreshData();
      setShowBookingModal(false);
      showToast(`Surgery booked in OT 1 for ${patient.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateCaseStatus = (id: string, status: OtCaseStatus) => {
    StorageService.updateOtStatus(id, status, currentUser.name);
    setOtBookings(StorageService.getOtBookings());
    refreshData();
    showToast(`Case status updated to ${status}`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Operation Theatre 1 (OT Suite) Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single OT conflict checking • Multi-resource time interval locks • Pre-Op Readiness checklist
          </p>
        </div>

        <button
          onClick={() => {
            setShowBookingModal(true);
            checkConflictRealtime(startTime, endTime, surgeonId, anesthesiologistId);
          }}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book Surgical Case</span>
        </button>
      </div>

      {/* OT Overview Info Card */}
      <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block font-semibold">Active Surgical Facility:</span>
          <span className="font-bold text-slate-900 text-sm">Theatre 1 (Laminar Flow Main OT)</span>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold">Anesthesia & PAC Lead:</span>
          <span className="font-bold text-teal-900">Dr. Ankit Jain (MD, DA)</span>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold">Conflict Resolution Protocol:</span>
          <span className="font-semibold text-teal-800">Atomic time interval checking active</span>
        </div>
      </div>

      {/* Booked OT Cases Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">Scheduled Surgical Cases for Today ({otBookings.length})</h3>

        <div className="space-y-3">
          {otBookings.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition">
              <div className="flex items-start gap-4">
                <div className="text-center px-3 py-2 bg-slate-900 text-white rounded-xl font-mono text-xs flex-shrink-0">
                  <span className="block font-bold">{b.startTime}</span>
                  <span className="text-[10px] text-slate-400">to</span>
                  <span className="block font-bold">{b.endTime}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      {b.theatreName}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{b.procedureName}</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Patient: <b>{b.patientName}</b> ({b.uhid}) • Duration: {b.durationMinutes} mins
                  </p>
                  <p className="text-xs text-slate-500">
                    Primary Surgeon: <b className="text-slate-800">{b.surgeonName}</b> • Anesthesia:{' '}
                    <b className="text-teal-800">{b.anesthesiologistName || 'None Required'}</b>
                  </p>
                  {b.notes && <p className="text-[11px] text-slate-500 italic">Notes: {b.notes}</p>}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  b.status === 'in_progress' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                  b.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                  b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {b.status.replace('_', ' ')}
                </span>

                {b.status === 'scheduled' && (
                  <button
                    onClick={() => updateCaseStatus(b.id, 'preparation')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Start Prep
                  </button>
                )}

                {b.status === 'preparation' && (
                  <button
                    onClick={() => updateCaseStatus(b.id, 'in_progress')}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>In Surgery</span>
                  </button>
                )}

                {b.status === 'in_progress' && (
                  <button
                    onClick={() => updateCaseStatus(b.id, 'completed')}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New OT Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Schedule OT Procedure</h3>
              <button onClick={() => setShowBookingModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Real-time Conflict Alert Box */}
            {conflictWarning && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Resource / Time Conflict Detected!</p>
                  <p className="text-[11px] text-rose-800 mt-0.5">{conflictWarning}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient UHID</label>
                <select
                  value={patientUhid}
                  onChange={e => setPatientUhid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procedure Name</label>
                <input
                  type="text"
                  required
                  value={procedureName}
                  onChange={e => setProcedureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => {
                      setBookingDate(e.target.value);
                      checkConflictRealtime(startTime, endTime, surgeonId, anesthesiologistId);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => {
                      setStartTime(e.target.value);
                      checkConflictRealtime(e.target.value, endTime, surgeonId, anesthesiologistId);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => {
                      setEndTime(e.target.value);
                      checkConflictRealtime(startTime, e.target.value, surgeonId, anesthesiologistId);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Surgeon</label>
                  <select
                    value={surgeonId}
                    onChange={e => {
                      setSurgeonId(e.target.value);
                      checkConflictRealtime(startTime, endTime, e.target.value, anesthesiologistId);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="DOC-001">Dr. Vandana Jain (Gynecologist/Obstetrician)</option>
                    <option value="DOC-003">Dr. Devendra Swastik (General Surgeon)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Anesthesia Requirement</label>
                  <select
                    value={requiresAnesthesia ? 'yes' : 'no'}
                    onChange={e => {
                      const req = e.target.value === 'yes';
                      setRequiresAnesthesia(req);
                      checkConflictRealtime(startTime, endTime, surgeonId, req ? anesthesiologistId : undefined);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="yes">Yes — Anesthesiologist Required</option>
                    <option value="no">No — Local / Minor Procedure</option>
                  </select>
                </div>
              </div>

              {requiresAnesthesia && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Anesthesiologist</label>
                  <select
                    value={anesthesiologistId}
                    onChange={e => {
                      setAnesthesiologistId(e.target.value);
                      checkConflictRealtime(startTime, endTime, surgeonId, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-800"
                  >
                    <option value="DOC-002">Dr. Ankit Jain (MD, DA - In-House Consultant)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pre-Op Notes & Resource Preparation</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button
                  type="submit"
                  disabled={conflictWarning !== null}
                  className={`font-bold px-5 py-2 rounded-xl text-white ${
                    conflictWarning ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  Confirm OT Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
