import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { EmergencyCase, TriageCategory, EmergencyDisposition } from '../../types';
import { 
  AlertOctagon, AlertTriangle, CheckCircle2, UserPlus, 
  ArrowRight, Activity, Clock, ShieldCheck, HeartPulse
} from 'lucide-react';

export const EmergencyModule: React.FC = () => {
  const { emergencyCases, refreshData, showToast, patients, setActiveModule } = useApp();

  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState('Male');
  const [triage, setTriage] = useState<TriageCategory>('red');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Ankit Jain');
  const [chiefComplaint, setChiefComplaint] = useState('Severe polytrauma, hypotension, altered sensorium');
  const [bp, setBp] = useState('85/55');
  const [pulse, setPulse] = useState(122);
  const [spO2, setSpO2] = useState(91);
  const [temp, setTemp] = useState(98.0);
  const [treatmentGiven, setTreatmentGiven] = useState('Oxygen started @ 6L/min via mask. 2 Large bore IV lines secured. 1000ml crystalloid running.');
  const [disposition, setDisposition] = useState<EmergencyDisposition>('observation');

  // Reconcile modal
  const [reconcileCase, setReconcileCase] = useState<EmergencyCase | null>(null);
  const [selectedPermanentUhid, setSelectedPermanentUhid] = useState('');

  const handleArrivalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Patient name or Unknown description is required', 'error');
      return;
    }

    const newCase = StorageService.saveEmergencyCase({
      patientName,
      age: Number(age),
      gender,
      triage,
      attendingDoctor,
      chiefComplaint,
      vitals: { bp, pulse, spO2, temp },
      treatmentGiven,
      disposition,
      status: 'active'
    });

    refreshData();
    setShowArrivalModal(false);
    showToast(`Emergency case registered with Temporary ID ${newCase.temporaryUhid}!`, 'success');

    // Reset
    setPatientName('');
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileCase || !selectedPermanentUhid) return;

    const list = StorageService.getEmergencyCases();
    const idx = list.findIndex(c => c.id === reconcileCase.id);
    if (idx >= 0) {
      list[idx].reconciledWithPermanentUhid = selectedPermanentUhid;
      localStorage.setItem('swastik_emergency_v1', JSON.stringify(list));
      StorageService.logAudit('Emergency Staff', 'EMERGENCY_RECONCILE', 'Emergency', reconcileCase.temporaryUhid, `Reconciled temporary ID with permanent UHID ${selectedPermanentUhid}`);
      refreshData();
      setReconcileCase(null);
      showToast('Temporary Emergency ID successfully reconciled with Permanent UHID!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-400/30">
              24x7 Emergency Trauma & Triage Department
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Emergency Clinical Triage & Stabilization</h2>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Red / Yellow / Green protocol • Fast temporary identity generation • Direct IPD handover
          </p>
        </div>

        <button
          onClick={() => setShowArrivalModal(true)}
          className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition self-start sm:self-center"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>New Emergency Arrival</span>
        </button>
      </div>

      {/* Triage Level Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-rose-900">RED: Immediate Resuscitation</span>
          </div>
          <p className="text-[11px] text-rose-800">Airway compromise, cardiac arrest, severe trauma, shock. Attended immediately.</p>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-amber-900">YELLOW: Urgent (Within 15 mins)</span>
          </div>
          <p className="text-[11px] text-amber-800">Severe pain, fracture, dyspnea, high fever, altered vitals without decompensation.</p>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-900">GREEN: Non-urgent (Standard queue)</span>
          </div>
          <p className="text-[11px] text-emerald-800">Minor cuts, stable vitals, ambulatory symptoms suitable for OPD or observation.</p>
        </div>
      </div>

      {/* Active Emergency Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Emergency Department Encounters ({emergencyCases.length})
        </h3>

        <div className="space-y-3">
          {emergencyCases.map(emg => {
            const isRed = emg.triage === 'red';
            const isYellow = emg.triage === 'yellow';

            return (
              <div 
                key={emg.id}
                className={`p-4 rounded-xl border-2 transition ${
                  isRed ? 'border-rose-300 bg-rose-50/40' :
                  isYellow ? 'border-amber-300 bg-amber-50/40' :
                  'border-emerald-300 bg-emerald-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                        isRed ? 'bg-rose-600 animate-pulse' :
                        isYellow ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {emg.triage} priority
                      </span>
                      <h4 className="font-bold text-base text-slate-900">{emg.patientName}</h4>
                      <span className="text-xs text-slate-500">({emg.age} yrs / {emg.gender})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Temp ID: <b className="font-mono text-slate-800">{emg.temporaryUhid}</b> • Arrived: {new Date(emg.arrivalTime).toLocaleTimeString()} • Doctor: <b>{emg.attendingDoctor}</b>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {emg.reconciledWithPermanentUhid ? (
                      <span className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Reconciled: {emg.reconciledWithPermanentUhid}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setReconcileCase(emg);
                          if (patients.length > 0) setSelectedPermanentUhid(patients[0].uhid);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition"
                      >
                        Reconcile UHID
                      </button>
                    )}

                    {emg.disposition !== 'admitted_ipd' && (
                      <button
                        onClick={() => {
                          setActiveModule('ipd');
                          showToast(`Initiating IPD bed admission for ${emg.patientName}`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
                      >
                        Admit to IPD Bed
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-semibold">Chief Complaint & Trauma Assessment:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{emg.chiefComplaint}</p>
                    <div className="flex gap-4 mt-2 text-slate-600 text-[11px]">
                      <span>BP: <b>{emg.vitals.bp}</b></span>
                      <span>Pulse: <b>{emg.vitals.pulse} bpm</b></span>
                      <span>SpO2: <b className={emg.vitals.spO2 < 93 ? 'text-rose-600' : 'text-slate-900'}>{emg.vitals.spO2}%</b></span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold">Emergency Treatment Documented:</span>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{emg.treatmentGiven}</p>
                    <p className="text-[11px] text-teal-800 font-bold mt-2">
                      Disposition: <span className="capitalize">{emg.disposition.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Emergency Arrival Modal */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Rapid Emergency Triage Intake</h3>

            <form onSubmit={handleArrivalSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name / Identifier *</label>
                  <input type="text" required value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Unknown Male / Kunal Saxena" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Triage Protocol Category *</label>
                  <select value={triage} onChange={e => setTriage(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 font-bold text-rose-900">
                    <option value="red">RED: Immediate Resuscitation</option>
                    <option value="yellow">YELLOW: Urgent (15 Mins)</option>
                    <option value="green">GREEN: Non-Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Clinician</label>
                  <select value={attendingDoctor} onChange={e => setAttendingDoctor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="Dr. Ankit Jain">Dr. Ankit Jain (Critical Care)</option>
                    <option value="Dr. Devendra Swastik">Dr. Devendra Swastik (Emergency Lead)</option>
                    <option value="Dr. Vandana Jain">Dr. Vandana Jain (Obstetric Emergency)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Emergency Complaints</label>
                <input type="text" required value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">BP</label>
                  <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">Pulse</label>
                  <input type="number" value={pulse} onChange={e => setPulse(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">SpO2 (%)</label>
                  <input type="number" value={spO2} onChange={e => setSpO2(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">Temp</label>
                  <input type="number" step="0.1" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Treatment Administered</label>
                <textarea rows={2} value={treatmentGiven} onChange={e => setTreatmentGiven(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowArrivalModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl">Register Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Reconcile Temporary Emergency Identity</h3>
            <p className="text-xs text-slate-500">
              Link Temporary ID <b>{reconcileCase.temporaryUhid}</b> ({reconcileCase.patientName}) to permanent hospital UHID records.
            </p>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Verified Permanent UHID</label>
                <select
                  value={selectedPermanentUhid}
                  onChange={e => setSelectedPermanentUhid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid}) - Mob: {p.mobile}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReconcileCase(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Confirm Reconciliation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
