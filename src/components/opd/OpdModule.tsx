import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { OpdQueueToken, PrescriptionItem, InvestigationOrderItem, ClinicalConsultation } from '../../types';
import { 
  Stethoscope, Users, Clock, Play, CheckCircle2, 
  Printer, Plus, Trash2, Baby, Activity, AlertCircle, FileText
} from 'lucide-react';

export const OpdModule: React.FC = () => {
  const { 
    t, queueTokens, patients, refreshData, showToast, 
    currentUser, openPrintDoc, setActiveModule 
  } = useApp();

  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<'all' | 'DOC-001' | 'DOC-002'>('DOC-001');
  const [activeConsultationToken, setActiveConsultationToken] = useState<OpdQueueToken | null>(null);

  // Consultation Form state
  const [chiefComplaints, setChiefComplaints] = useState('Routine checkup and clinical examination');
  const [historyIllness, setHistoryIllness] = useState('No acute distress reported.');
  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [pulse, setPulse] = useState(76);
  const [temperature, setTemperature] = useState(98.6);
  const [spO2, setSpO2] = useState(99);
  const [weight, setWeight] = useState(62);
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-11-01');

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      medicineId: 'MED-001',
      medicineName: 'Augmentin 625mg Tab',
      dosage: '1 tab',
      frequency: '1-0-1',
      duration: '5 days',
      instructions: 'After meals with water'
    }
  ]);

  // Investigations list
  const [investigations, setInvestigations] = useState<InvestigationOrderItem[]>([
    {
      id: 'INV-ORD-1',
      serviceId: 'LAB-CBC',
      serviceName: 'Complete Blood Count (CBC)',
      type: 'laboratory'
    }
  ]);

  // Dr. Vandana Jain Specialty Template State (Gynecology & Obstetrics)
  const [gravida, setGravida] = useState(2);
  const [para, setPara] = useState(1);
  const [abortion, setAbortion] = useState(0);
  const [living, setLiving] = useState(1);
  const [lmpDate, setLmpDate] = useState('2026-02-14');
  const [eddDate, setEddDate] = useState('2026-11-21');
  const [fetalHeartRate, setFetalHeartRate] = useState(144);
  const [usgFindings, setUsgFindings] = useState('Single live term fetus, cephalic presentation, adequate liquor');

  // Dr. Ankit Jain Specialty Template State (Anesthesia & PAC)
  const [mallampati, setMallampati] = useState<'Class I' | 'Class II' | 'Class III' | 'Class IV'>('Class I');
  const [asaGrade, setAsaGrade] = useState<'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V' | 'ASA E'>('ASA I');
  const [airway, setAirway] = useState('Normal neck mobility, mouth opening > 3 fingers, thyromental distance adequate');
  const [npoHours, setNpoHours] = useState(8);
  const [anesthesiaPlan, setAnesthesiaPlan] = useState<'General' | 'Spinal' | 'Epidural' | 'Local' | 'MAC'>('Spinal');
  const [fitnessApproved, setFitnessApproved] = useState(true);

  // New Prescription Add
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 tab');
  const [newMedFreq, setNewMedFreq] = useState('1-0-1');
  const [newMedDuration, setNewMedDuration] = useState('5 days');
  const [newMedInstructions, setNewMedInstructions] = useState('After food');

  const handleAddMedicine = () => {
    if (!newMedName) return;
    setPrescriptions([
      ...prescriptions,
      {
        medicineId: `MED-CUSTOM-${Date.now()}`,
        medicineName: newMedName,
        dosage: newMedDosage,
        frequency: newMedFreq,
        duration: newMedDuration,
        instructions: newMedInstructions
      }
    ]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const startConsultation = (token: OpdQueueToken) => {
    StorageService.updateQueueStatus(token.id, 'in_consultation', currentUser.name);
    refreshData();
    setActiveConsultationToken(token);
    
    // Set appropriate initial diagnosis
    if (token.doctorId === 'DOC-001') {
      setDiagnosis('Antenatal 36 Weeks Pregnancy (Cephalic)');
    } else {
      setDiagnosis('Pre-Anesthetic Fitness Assessment for Elective Surgery');
    }
  };

  const handleFinishConsultation = () => {
    if (!activeConsultationToken) return;

    const patient = patients.find(p => p.uhid === activeConsultationToken.uhid);

    const consultationData: ClinicalConsultation = {
      id: `CON-${Date.now()}`,
      encounterId: activeConsultationToken.encounterId,
      uhid: activeConsultationToken.uhid,
      doctorId: activeConsultationToken.doctorId,
      doctorName: activeConsultationToken.doctorName,
      date: new Date().toISOString(),
      chiefComplaints,
      historyOfPresentIllness: historyIllness,
      vitals: {
        bpSystolic,
        bpDiastolic,
        pulse,
        temperature,
        spO2,
        weight
      },
      allergiesNoted: patient?.allergies || [],
      diagnosis,
      clinicalNotes,
      prescriptions,
      investigations,
      followUpDate,
      gynecologyData: activeConsultationToken.doctorId === 'DOC-001' ? {
        gravida,
        para,
        abortion,
        living,
        lmpDate,
        eddDate,
        gestationalAgeWeeks: 36,
        ultrasoundFindings: usgFindings,
        fetalHeartRate
      } : undefined,
      anesthesiaData: activeConsultationToken.doctorId === 'DOC-002' ? {
        mallampatiClass: mallampati,
        asaGrade,
        airwayAssessment: airway,
        npoHours,
        anesthesiaPlan,
        fitnessApproved
      } : undefined,
      finalized: true,
      finalizedAt: new Date().toISOString()
    };

    StorageService.saveConsultation(consultationData, currentUser.name);
    StorageService.updateQueueStatus(activeConsultationToken.id, 'completed', currentUser.name);
    refreshData();
    showToast(`Consultation for ${activeConsultationToken.patientName} saved and completed!`, 'success');

    // Trigger Print
    openPrintDoc({
      type: 'prescription',
      title: 'Digital OPD Prescription & Clinical Notes',
      data: {
        ...consultationData,
        patientName: activeConsultationToken.patientName,
        age: patient?.age || 30,
        gender: patient?.gender || 'Female'
      }
    });

    setActiveConsultationToken(null);
  };

  const filteredQueue = queueTokens.filter(t => {
    if (selectedDoctorFilter === 'all') return true;
    return t.doctorId === selectedDoctorFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Doctor Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <span>Digital OPD Consultation & Queue Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Token-based patient queues • Digital E-Prescription • Dr. Vandana & Dr. Ankit Specialty Templates
          </p>
        </div>

        {/* Doctor Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Doctor Queue:</span>
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Clinics</option>
            <option value="DOC-001">Dr. Vandana Jain (Gynecology)</option>
            <option value="DOC-002">Dr. Ankit Jain (Anesthesia / PAC)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Queue List + Active Digital Consultation Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Queue Board */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Today's Token Queue</h3>
              <p className="text-xs text-slate-500">{filteredQueue.length} patient tokens issued</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
              Auto Calling
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {filteredQueue.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No tokens in queue for this doctor.</p>
            ) : (
              filteredQueue.map(token => {
                const isSelected = activeConsultationToken?.id === token.id;
                return (
                  <div
                    key={token.id}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                        : token.status === 'in_consultation'
                        ? 'border-indigo-300 bg-indigo-50/40'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                          #{token.tokenNumber}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{token.patientName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{token.uhid}</p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        token.status === 'in_consultation' ? 'bg-indigo-100 text-indigo-800' :
                        token.status === 'called' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        token.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {token.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span>Doctor: <b>{token.doctorName.split(' ')[1]}</b></span>
                      <span>Checked-in: {token.checkInTime}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2.5 flex items-center justify-end gap-2">
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => {
                            StorageService.updateQueueStatus(token.id, 'called', currentUser.name);
                            refreshData();
                            showToast(`Calling Token #${token.tokenNumber} (${token.patientName}) to clinic`, 'info');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition"
                        >
                          Call Patient
                        </button>
                      )}

                      {['waiting', 'called'].includes(token.status) && (
                        <button
                          onClick={() => startConsultation(token)}
                          className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start Consult</span>
                        </button>
                      )}

                      {token.status === 'in_consultation' && !isSelected && (
                        <button
                          onClick={() => setActiveConsultationToken(token)}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Open Workspace
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Digital Consultation Workspace */}
        <div className="lg:col-span-2">
          {activeConsultationToken ? (
            <div className="bg-white rounded-2xl border-2 border-teal-600 shadow-xl p-6 space-y-6">
              
              {/* Consultation Header */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/50 p-4 rounded-xl -mt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-teal-700 text-white font-mono font-bold flex items-center justify-center text-sm">
                      #{activeConsultationToken.tokenNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{activeConsultationToken.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        Permanent UHID: <b className="text-slate-800">{activeConsultationToken.uhid}</b> • Encounter: <b className="text-teal-800">{activeConsultationToken.encounterId}</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-teal-700 text-white font-bold text-xs">
                    {activeConsultationToken.doctorName}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Live Digital Encounter</p>
                </div>
              </div>

              {/* 1. Vitals Entry */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-600 mb-2">Patient Vitals</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">BP (Systolic)</label>
                    <input
                      type="number"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">BP (Diastolic)</label>
                    <input
                      type="number"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Doctor Specialty Templates */}
              {activeConsultationToken.doctorId === 'DOC-001' ? (
                /* Dr. Vandana Jain Gynecology Template */
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs border-b border-teal-200 pb-2">
                    <Baby className="w-4 h-4 text-teal-700" />
                    <span>Specialty Workflow: Dr. Vandana Jain — Gynecology & Obstetric Evaluation</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Gravida (G)</label>
                      <input type="number" value={gravida} onChange={e => setGravida(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-teal-300 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Para (P)</label>
                      <input type="number" value={para} onChange={e => setPara(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-teal-300 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">LMP Date</label>
                      <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className="w-full px-2 py-1 rounded border border-teal-300 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Expected Date of Delivery (EDD)</label>
                      <input type="date" value={eddDate} onChange={e => setEddDate(e.target.value)} className="w-full px-2 py-1 rounded border border-teal-300 bg-white font-bold text-teal-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Fetal Heart Rate (bpm)</label>
                      <input type="number" value={fetalHeartRate} onChange={e => setFetalHeartRate(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-teal-300 bg-white font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Ultrasound / Doppler Findings</label>
                      <input type="text" value={usgFindings} onChange={e => setUsgFindings(e.target.value)} className="w-full px-2 py-1 rounded border border-teal-300 bg-white" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Dr. Ankit Jain Anesthesia PAC Template */
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs border-b border-indigo-200 pb-2">
                    <Activity className="w-4 h-4 text-indigo-700" />
                    <span>Specialty Workflow: Dr. Ankit Jain — Anesthesia & Pre-Operative Assessment (PAC)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Mallampati Airway Score</label>
                      <select value={mallampati} onChange={e => setMallampati(e.target.value as any)} className="w-full px-2 py-1.5 rounded border border-indigo-300 bg-white font-bold">
                        <option value="Class I">Class I (Full visualization of soft palate)</option>
                        <option value="Class II">Class II (Uvula partially visible)</option>
                        <option value="Class III">Class III (Base of uvula visible)</option>
                        <option value="Class IV">Class IV (Hard palate only)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">ASA Physical Status</label>
                      <select value={asaGrade} onChange={e => setAsaGrade(e.target.value as any)} className="w-full px-2 py-1.5 rounded border border-indigo-300 bg-white font-bold">
                        <option value="ASA I">ASA I (Normal Healthy)</option>
                        <option value="ASA II">ASA II (Mild Systemic Disease)</option>
                        <option value="ASA III">ASA III (Severe Systemic Disease)</option>
                        <option value="ASA IV">ASA IV (Life Threatening)</option>
                        <option value="ASA E">ASA E (Emergency Surgery)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Planned Anesthesia Technique</label>
                      <select value={anesthesiaPlan} onChange={e => setAnesthesiaPlan(e.target.value as any)} className="w-full px-2 py-1.5 rounded border border-indigo-300 bg-white font-bold text-indigo-800">
                        <option value="Spinal">Subarachnoid / Spinal Anesthesia</option>
                        <option value="General">General Anesthesia with ETT</option>
                        <option value="Epidural">Epidural Analgesia</option>
                        <option value="MAC">Monitored Anesthesia Care (MAC)</option>
                        <option value="Local">Local Infiltration</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">Airway & Cervical Spine Assessment</label>
                      <input type="text" value={airway} onChange={e => setAirway(e.target.value)} className="w-full px-2 py-1 rounded border border-indigo-300 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-semibold">NPO / Fasting Status (Hours)</label>
                      <input type="number" value={npoHours} onChange={e => setNpoHours(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-indigo-300 bg-white font-bold" />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Diagnosis & Clinical Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Clinical Diagnosis"
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Advice Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-teal-800"
                  />
                </div>
              </div>

              {/* 4. Prescription Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-slate-600">Prescribed Medications</h4>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2">Medicine</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Frequency</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2">Instructions</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{p.medicineName}</td>
                          <td className="p-2 text-slate-700">{p.dosage}</td>
                          <td className="p-2 font-semibold text-teal-700">{p.frequency}</td>
                          <td className="p-2 text-slate-700">{p.duration}</td>
                          <td className="p-2 text-slate-500 italic">{p.instructions}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Quick Medicine Row */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
                  <input
                    type="text"
                    placeholder="Medicine Name"
                    value={newMedName}
                    onChange={e => setNewMedName(e.target.value)}
                    className="sm:col-span-2 px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (1 tab)"
                    value={newMedDosage}
                    onChange={e => setNewMedDosage(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Freq (1-0-1)"
                    value={newMedFreq}
                    onChange={e => setNewMedFreq(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={newMedDuration}
                    onChange={e => setNewMedDuration(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1.5 rounded-lg text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Complete & Print Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveConsultationToken(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hold / Minimize
                </button>
                <button
                  type="button"
                  onClick={handleFinishConsultation}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize & Print Prescription</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Doctor Consultation Desk</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select a patient from the queue on the left and click <b>"Start Consult"</b> to open the digital consultation suite with vitals, specialty templates, e-prescriptions, and order sets.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
