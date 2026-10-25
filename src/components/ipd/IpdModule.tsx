import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Bed, Admission, InpatientVitalRecord, MedicationAdministrationRecord } from '../../types';
import { 
  BedDouble, Plus, ArrowRightLeft, CheckCircle2, AlertCircle, 
  Printer, Activity, Heart, Pill, User, Clock, FileText, X
} from 'lucide-react';

export const IpdModule: React.FC = () => {
  const { 
    t, beds, admissions, patients, refreshData, showToast, 
    currentUser, openPrintDoc 
  } = useApp();

  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  
  // Modals
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showDischargeAuthModal, setShowDischargeAuthModal] = useState(false);

  // Admit form state
  const [admitUhid, setAdmitUhid] = useState('SH-2026-00103');
  const [admitBedId, setAdmitBedId] = useState('BED-GF-02');
  const [admitDoctor, setAdmitDoctor] = useState('Dr. Vandana Jain');
  const [admitReason, setAdmitReason] = useState('Observation & Monitoring for Severe Pelvic Pain');
  const [attendantName, setAttendantName] = useState('Amit Tiwari');
  const [attendantPhone, setAttendantPhone] = useState('9833445567');
  const [attendantRelation, setAttendantRelation] = useState('Husband');

  // Transfer state
  const [targetBedId, setTargetBedId] = useState('');

  // Vitals form state
  const [vBpSys, setVBpSys] = useState(120);
  const [vBpDia, setVBpDia] = useState(80);
  const [vPulse, setVPulse] = useState(78);
  const [vTemp, setVTemp] = useState(98.4);
  const [vSpO2, setVSpO2] = useState(99);
  const [vResp, setVResp] = useState(18);
  const [vNursingNotes, setVNursingNotes] = useState('Patient resting comfortably. Vitals stable.');

  // Clinical discharge authorization notes
  const [clinicalNotes, setClinicalNotes] = useState('Patient recovered satisfactorily. Afebrile. Surgical wound healing well. Fit for discharge with oral medications.');

  const totalBeds = beds.length;
  const occupiedCount = beds.filter(b => b.status === 'occupied').length;
  const availableCount = beds.filter(b => b.status === 'available').length;
  const cleaningCount = beds.filter(b => b.status === 'cleaning_blocked').length;

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.uhid === admitUhid);
    if (!patient) {
      showToast('Patient not found with UHID ' + admitUhid, 'error');
      return;
    }
    const targetBed = beds.find(b => b.id === admitBedId);
    if (!targetBed || targetBed.status !== 'available') {
      showToast('Selected bed is not available', 'error');
      return;
    }

    const doctorId = admitDoctor.includes('Vandana') ? 'DOC-001' : 'DOC-002';

    const newAdm = StorageService.admitPatient({
      uhid: patient.uhid,
      patientName: patient.name,
      gender: patient.gender,
      age: patient.age,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      wardName: targetBed.wardName,
      attendingDoctorId: doctorId,
      attendingDoctorName: admitDoctor,
      admissionDate: new Date().toISOString(),
      admissionReason: admitReason,
      attendantDetails: {
        name: attendantName,
        phone: attendantPhone,
        relation: attendantRelation
      }
    });

    refreshData();
    setShowAdmitModal(false);
    showToast(`Admitted ${patient.name} to Bed ${targetBed.bedNumber} (Admission ID: ${newAdm.admissionId})`, 'success');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission || !targetBedId) return;

    try {
      StorageService.transferBed(selectedAdmission.admissionId, targetBedId, currentUser.name);
      refreshData();
      setShowTransferModal(false);
      showToast('Patient transferred successfully! Old bed marked for cleaning.', 'success');
      const updated = StorageService.getAdmissions().find(a => a.admissionId === selectedAdmission.admissionId);
      if (updated) setSelectedAdmission(updated);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    StorageService.recordInpatientVital({
      admissionId: selectedAdmission.admissionId,
      uhid: selectedAdmission.uhid,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
      bpSystolic: vBpSys,
      bpDiastolic: vBpDia,
      pulse: vPulse,
      temperature: vTemp,
      spO2: vSpO2,
      respiratoryRate: vResp,
      nursingNotes: vNursingNotes
    });

    refreshData();
    setShowVitalsModal(false);
    showToast('Inpatient vitals and nursing observations recorded!', 'success');
  };

  const handleAuthorizeDischarge = () => {
    if (!selectedAdmission) return;
    StorageService.authorizeClinicalDischarge(
      selectedAdmission.admissionId,
      currentUser.name,
      clinicalNotes
    );
    refreshData();
    setShowDischargeAuthModal(false);
    showToast(`Clinical discharge authorized by ${currentUser.name}! Bill reconciliation can proceed.`, 'success');
    const updated = StorageService.getAdmissions().find(a => a.admissionId === selectedAdmission.admissionId);
    if (updated) setSelectedAdmission(updated);
  };

  const handleFinalizeDischarge = () => {
    if (!selectedAdmission) return;
    try {
      StorageService.finalizeDischarge(selectedAdmission.admissionId, currentUser.name);
      refreshData();
      showToast(`Admission ${selectedAdmission.admissionId} finalized & discharged. Bed marked for cleaning.`, 'success');
      
      // Prompt Discharge Summary Print
      openPrintDoc({
        type: 'discharge_summary',
        title: 'IPD Discharge Summary & Instructions',
        data: {
          ...selectedAdmission,
          clinicalDischargeNotes: clinicalNotes
        }
      });
      setSelectedAdmission(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    if (wardFilter === 'all') return true;
    return b.wardType === wardFilter;
  });

  const availableBedsList = beds.filter(b => b.status === 'available');
  const inpatientVitals = selectedAdmission ? StorageService.getInpatientVitals(selectedAdmission.admissionId) : [];
  const inpatientMar = selectedAdmission ? StorageService.getMarRecords(selectedAdmission.admissionId) : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Bed Counts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" />
            <span>IPD Bed Board & Inpatient Nursing (35 Beds Capacity)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time floor occupancy • Bed transfers • Inpatient vitals timeline • Medication Administration Record (MAR)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdmitModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Direct IPD Admission</span>
          </button>
        </div>
      </div>

      {/* Bed Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Configured</span>
            <span className="text-xl font-black text-slate-900">{totalBeds} Beds</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">5 Wards</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 block">Occupied / Admitted</span>
            <span className="text-xl font-black text-teal-900">{occupiedCount} Beds</span>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded">
            {Math.round((occupiedCount / totalBeds) * 100)}% Occ
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 block">Vacant / Available</span>
            <span className="text-xl font-black text-emerald-700">{availableCount} Beds</span>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">Ready</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 block">Cleaning / Blocked</span>
            <span className="text-xl font-black text-amber-800">{cleaningCount} Beds</span>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded">Turnaround</span>
        </div>
      </div>

      {/* Ward Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-semibold text-slate-500 mr-2">Filter Ward:</span>
        {[
          { id: 'all', label: 'All 35 Beds' },
          { id: 'general_male', label: 'General Ward (Male - 10)' },
          { id: 'general_female', label: 'General Ward (Female - 10)' },
          { id: 'semi_private', label: 'Semi-Private (8)' },
          { id: 'deluxe_private', label: 'Deluxe Private (4)' },
          { id: 'icu', label: 'ICU (3)' },
        ].map(wf => (
          <button
            key={wf.id}
            onClick={() => setWardFilter(wf.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              wardFilter === wf.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {wf.label}
          </button>
        ))}
      </div>

      {/* Interactive 35-Bed Floor Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredBeds.map(bed => {
          const isOccupied = bed.status === 'occupied';
          const isAvailable = bed.status === 'available';
          const isCleaning = bed.status === 'cleaning_blocked';
          const isReserved = bed.status === 'reserved';
          const isMaintenance = bed.status === 'maintenance';

          return (
            <div
              key={bed.id}
              onClick={() => {
                if (isOccupied && bed.currentAdmissionId) {
                  const adm = admissions.find(a => a.admissionId === bed.currentAdmissionId);
                  if (adm) setSelectedAdmission(adm);
                } else if (isCleaning) {
                  // Quick release bed from cleaning
                  StorageService.updateBedStatus(bed.id, 'available');
                  refreshData();
                  showToast(`Bed ${bed.bedNumber} marked Clean & Available!`, 'success');
                }
              }}
              className={`p-3.5 rounded-2xl border-2 transition relative flex flex-col justify-between min-h-[120px] cursor-pointer ${
                isOccupied
                  ? 'border-teal-600 bg-teal-50/70 shadow-sm hover:shadow-md'
                  : isAvailable
                  ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-500'
                  : isCleaning
                  ? 'border-amber-300 bg-amber-50/50 hover:border-amber-500'
                  : isReserved
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-slate-300 bg-slate-100 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono font-black text-sm text-slate-900">{bed.bedNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  isOccupied ? 'bg-teal-700 text-white' :
                  isAvailable ? 'bg-emerald-100 text-emerald-800' :
                  isCleaning ? 'bg-amber-100 text-amber-800' :
                  isReserved ? 'bg-indigo-100 text-indigo-800' :
                  'bg-slate-300 text-slate-700'
                }`}>
                  {bed.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-2">
                {isOccupied ? (
                  <div>
                    <p className="font-bold text-xs text-slate-900 truncate">{bed.currentPatientName}</p>
                    <p className="font-mono text-[10px] text-teal-800">{bed.currentUhid}</p>
                  </div>
                ) : isCleaning ? (
                  <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <span>Cleaning / Disinfection</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700 font-medium">Ready for allocation</p>
                )}
              </div>

              <div className="mt-2 pt-1 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-500">
                <span className="truncate">{bed.wardName.split(' ')[0]}</span>
                <span className="font-semibold text-slate-700">₹{bed.chargePerDay}/d</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Inpatient Detail Chart Modal / Drawer */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 my-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-teal-700 text-white font-mono font-bold text-xs">
                    {selectedAdmission.bedNumber} ({selectedAdmission.wardName})
                  </span>
                  <h3 className="font-bold text-lg text-slate-900">{selectedAdmission.patientName}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Permanent UHID: <b className="text-slate-800">{selectedAdmission.uhid}</b> • Admission ID: <b className="text-teal-800">{selectedAdmission.admissionId}</b> • Admitted: {new Date(selectedAdmission.admissionDate).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedAdmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Inpatient Info Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Attending Consultant:</span>
                <span className="font-bold text-slate-900">{selectedAdmission.attendingDoctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Attendant Info:</span>
                <span className="font-semibold text-slate-800">{selectedAdmission.attendantDetails.name} ({selectedAdmission.attendantDetails.relation}): {selectedAdmission.attendantDetails.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Clinical Discharge Status:</span>
                <span className={`font-bold ${selectedAdmission.clinicalDischargeAuthorized ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedAdmission.clinicalDischargeAuthorized ? 'Authorized by Doctor' : 'Under Active Care'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Admission Reason:</span>
                <span className="font-semibold text-slate-800">{selectedAdmission.admissionReason}</span>
              </div>
            </div>

            {/* Inpatient Tabs: 1. Nursing Vitals, 2. MAR, 3. Bed History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Vitals Timeline */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-slate-600 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>Inpatient Vitals & Observations</span>
                  </h4>
                  <button
                    onClick={() => setShowVitalsModal(true)}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    + Record Vitals
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                  {inpatientVitals.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No vitals charted yet.</p>
                  ) : (
                    inpatientVitals.map(v => (
                      <div key={v.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                          <span>{new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {v.recordedBy}</span>
                          <span className="text-teal-700">SpO2: {v.spO2}%</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 font-bold text-slate-800 text-[11px]">
                          <span>BP: {v.bpSystolic}/{v.bpDiastolic}</span>
                          <span>Pulse: {v.pulse}</span>
                          <span>Temp: {v.temperature}°F</span>
                          <span>Resp: {v.respiratoryRate}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 italic">{v.nursingNotes}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Medication Administration Record (MAR) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-slate-600 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>Medication Administration Record (MAR)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Strict Clinical Logging</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                  {inpatientMar.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No scheduled inpatient medicines.</p>
                  ) : (
                    inpatientMar.map(m => (
                      <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{m.medicineName}</p>
                          <p className="text-[10px] text-slate-500">Dose: {m.dosage} • Sched: {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          {m.administeredTime && (
                            <p className="text-[10px] text-emerald-700 font-semibold">Administered by {m.administeredBy}</p>
                          )}
                        </div>

                        <div>
                          {m.status === 'administered' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Administered
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                StorageService.updateMarStatus(m.id, 'administered', currentUser.name);
                                refreshData();
                                showToast(`Administered ${m.medicineName}`, 'success');
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shadow-sm"
                            >
                              Administer
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Actions Bar: Bed Transfer, Clinical Discharge Authorization, Final Discharge */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                <span>Transfer Bed</span>
              </button>

              <div className="flex items-center gap-2">
                {!selectedAdmission.clinicalDischargeAuthorized ? (
                  <button
                    onClick={() => setShowDischargeAuthModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Clinical Discharge (Doctor)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clinically Cleared by {selectedAdmission.clinicalDischargeDoctor}</span>
                    </span>

                    <button
                      onClick={handleFinalizeDischarge}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Finalize & Print Discharge Summary</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Direct Admit Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Direct Inpatient Admission (IPD)</h3>
              <button onClick={() => setShowAdmitModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient UHID</label>
                <select
                  value={admitUhid}
                  onChange={(e) => setAdmitUhid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid}) - {p.gender}, {p.age} yrs</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Bed</label>
                  <select
                    value={admitBedId}
                    onChange={(e) => setAdmitBedId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-800"
                  >
                    {availableBedsList.map(b => (
                      <option key={b.id} value={b.id}>{b.bedNumber} - {b.wardName} (₹{b.chargePerDay}/d)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Consultant</label>
                  <select
                    value={admitDoctor}
                    onChange={(e) => setAdmitDoctor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Dr. Vandana Jain">Dr. Vandana Jain (Gynecology)</option>
                    <option value="Dr. Ankit Jain">Dr. Ankit Jain (Critical Care / PAC)</option>
                    <option value="Dr. Devendra Swastik">Dr. Devendra Swastik (General)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Diagnosis / Indication</label>
                <input
                  type="text"
                  required
                  value={admitReason}
                  onChange={(e) => setAdmitReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendant Name</label>
                  <input type="text" value={attendantName} onChange={e => setAttendantName(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                  <input type="text" value={attendantRelation} onChange={e => setAttendantRelation(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={attendantPhone} onChange={e => setAttendantPhone(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-300" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdmitModal(false)} className="px-4 py-2 rounded-xl text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Confirm Admission</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Transfer Modal */}
      {showTransferModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Bed Transfer for {selectedAdmission.patientName}</h3>
            <p className="text-xs text-slate-500">Current Bed: <b>{selectedAdmission.bedNumber}</b> ({selectedAdmission.wardName})</p>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Available Bed</label>
                <select
                  required
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-800"
                >
                  <option value="">-- Select Vacant Bed --</option>
                  {availableBedsList.map(b => (
                    <option key={b.id} value={b.id}>{b.bedNumber} ({b.wardName}) - ₹{b.chargePerDay}/day</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Upon transfer, Bed <b>{selectedAdmission.bedNumber}</b> will be automatically marked as <b>Cleaning/Blocked</b> for terminal sanitization.
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Inpatient Vitals Modal */}
      {showVitalsModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Record Vitals — {selectedAdmission.patientName}</h3>

            <form onSubmit={handleAddVitals} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">BP Systolic</label>
                  <input type="number" value={vBpSys} onChange={e => setVBpSys(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">BP Diastolic</label>
                  <input type="number" value={vBpDia} onChange={e => setVBpDia(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pulse Rate</label>
                  <input type="number" value={vPulse} onChange={e => setVPulse(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Temperature (°F)</label>
                  <input type="number" step="0.1" value={vTemp} onChange={e => setVTemp(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">SpO2 (%)</label>
                  <input type="number" value={vSpO2} onChange={e => setVSpO2(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Respiratory Rate</label>
                  <input type="number" value={vResp} onChange={e => setVResp(Number(e.target.value))} className="w-full px-2 py-1.5 rounded border border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nursing Observation Notes</label>
                <textarea rows={2} value={vNursingNotes} onChange={e => setVNursingNotes(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowVitalsModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Discharge Authorization Modal */}
      {showDischargeAuthModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Doctor Clinical Discharge Authorization</span>
            </h3>
            <p className="text-xs text-slate-500">
              Hospital Baseline Rule: Clinical discharge authorization is distinct from financial settlement.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discharge Summary & Clinical Condition</label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                Authorizing Clinician: <b>{currentUser.name}</b> ({currentUser.department}). Once authorized, the billing cashier can produce the final reconciled invoice.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDischargeAuthModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button
                  type="button"
                  onClick={handleAuthorizeDischarge}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Confirm Clinical Authorization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
