import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { DowntimeManualRecord } from '../../types';
import { WifiOff, Plus, CheckCircle2, AlertTriangle, FileSpreadsheet, X, ShieldCheck } from 'lucide-react';

export const DowntimeModule: React.FC = () => {
  const { isDowntimeMode, setDowntimeMode, refreshData, showToast, patients, currentUser } = useApp();

  const [downtimeRecords, setDowntimeRecords] = useState<DowntimeManualRecord[]>(StorageService.getDowntimeRecords());
  const [showAddModal, setShowAddModal] = useState(false);

  // New downtime entry fields
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [entryType, setEntryType] = useState<DowntimeManualRecord['entryType']>('opd_walkin');
  const [serviceRendered, setServiceRendered] = useState('Doctor Consultation & Routine Vitals');
  const [amountCollected, setAmountCollected] = useState<number>(600);
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Reconcile modal
  const [reconcilingRecord, setReconcilingRecord] = useState<DowntimeManualRecord | null>(null);
  const [targetUhid, setTargetUhid] = useState('SH-2026-00101');
  const [reconcileNotes, setReconcileNotes] = useState('Manual paper register entry verified against counter collection.');

  const handleCreateDowntimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const tempRef = `OFFLINE-MAN-${Math.floor(Math.random() * 900) + 100}`;

    const newRecord = StorageService.recordDowntimeEntry({
      tempReferenceId: tempRef,
      patientName,
      phone,
      entryType,
      attendingStaff: `${currentUser.name} (${currentUser.department})`,
      serviceRendered,
      amountCollected: Number(amountCollected),
      paymentMode,
      recordedTimestamp: new Date().toLocaleString()
    });

    setDowntimeRecords(StorageService.getDowntimeRecords());
    refreshData();
    setShowAddModal(false);
    showToast(`Downtime entry ${tempRef} recorded in local offline register!`, 'success');

    // Reset
    setPatientName('');
    setPhone('');
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingRecord) return;

    StorageService.reconcileDowntimeRecord(
      reconcilingRecord.id,
      targetUhid,
      `INV-REC-${Date.now().toString().slice(-4)}`,
      reconcileNotes,
      currentUser.name
    );

    setDowntimeRecords(StorageService.getDowntimeRecords());
    refreshData();
    setReconcilingRecord(null);
    showToast(`Offline record ${reconcilingRecord.tempReferenceId} reconciled with UHID ${targetUhid}!`, 'success');
  };

  const unreconciledCount = downtimeRecords.filter(r => !r.reconciled).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
        isDowntimeMode ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900' : 'bg-gradient-to-r from-slate-900 to-teal-950'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isDowntimeMode ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-teal-500/20 text-teal-300'
            }`}>
              {isDowntimeMode ? 'OUTAGE EMERGENCY MODE ACTIVE' : 'Business Continuity Plan'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Manual Downtime Register & Audit Reconciliation</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Controlled offline paper/local register protocol for internet outages • Reconcile transactions post-restoration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDowntimeMode(!isDowntimeMode)}
            className={`font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition ${
              isDowntimeMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            <span>{isDowntimeMode ? 'Restore Live Cloud Mode' : 'Simulate Outage Mode'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Downtime Entry</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Queue Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Offline Register Entries ({downtimeRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              {unreconciledCount} records pending post-outage permanent UHID matching & financial reconciliation
            </p>
          </div>
          {unreconciledCount > 0 && (
            <span className="px-3 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
              {unreconciledCount} Pending Reconciliation
            </span>
          )}
        </div>

        <div className="space-y-3">
          {downtimeRecords.map(rec => (
            <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {rec.tempReferenceId}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{rec.patientName}</h4>
                  <span className="text-slate-500 font-mono">({rec.phone})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    {rec.entryType.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700 font-medium mt-1">Service: {rec.serviceRendered}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Amount: <b className="text-slate-900">₹{rec.amountCollected}</b> via {rec.paymentMode} • Recorded: {rec.recordedTimestamp} by {rec.attendingStaff}
                </p>
                {rec.reconciliationNotes && (
                  <p className="text-[11px] text-teal-800 font-semibold mt-1">
                    Audit Note: {rec.reconciliationNotes} (Linked: {rec.reconciledPermanentUhid})
                  </p>
                )}
              </div>

              <div>
                {rec.reconciled ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reconciled ({rec.reconciledPermanentUhid})</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setReconcilingRecord(rec);
                      if (patients.length > 0) setTargetUhid(patients[0].uhid);
                    }}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
                  >
                    Reconcile With Permanent Record
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Downtime Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Log Manual Offline Register Entry</h3>

            <form onSubmit={handleCreateDowntimeEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input type="text" required value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Devi Prasad" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile" className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Department</label>
                  <select value={entryType} onChange={e => setEntryType(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="opd_walkin">OPD Walk-in</option>
                    <option value="emergency">Emergency Arrival</option>
                    <option value="ipd_admission">IPD Admission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Rendered</label>
                <input type="text" required value={serviceRendered} onChange={e => setServiceRendered(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Collected (₹)</label>
                  <input type="number" required min={0} value={amountCollected} onChange={e => setAmountCollected(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="Cash">Cash</option>
                    <option value="UPI Direct">UPI Direct</option>
                    <option value="Card">Card Slip</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl">Save Offline Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcilingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Reconcile Offline Entry: {reconcilingRecord.tempReferenceId}</span>
            </h3>
            <p className="text-xs text-slate-500">Patient: <b>{reconcilingRecord.patientName}</b> (Amount: ₹{reconcilingRecord.amountCollected})</p>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Permanent Patient UHID *</label>
                <select
                  value={targetUhid}
                  onChange={e => setTargetUhid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-900"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid}) - Mob: {p.mobile}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reconciliation Verification Notes *</label>
                <textarea
                  rows={2}
                  required
                  value={reconcileNotes}
                  onChange={e => setReconcileNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReconcilingRecord(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Confirm Reconciliation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
