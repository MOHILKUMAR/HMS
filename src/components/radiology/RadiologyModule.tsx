import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { RadiologyWorklistItem } from '../../types';
import { Eye, FileText, CheckCircle2, Clock, Printer, ShieldCheck, X } from 'lucide-react';

export const RadiologyModule: React.FC = () => {
  const { refreshData, showToast, currentUser, openPrintDoc } = useApp();

  const [worklist, setWorklist] = useState<RadiologyWorklistItem[]>(StorageService.getRadiologyWorklist());
  const [modalityFilter, setModalityFilter] = useState('all');

  // Reporting modal
  const [reportingItem, setReportingItem] = useState<RadiologyWorklistItem | null>(null);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');

  const handleOpenReportModal = (item: RadiologyWorklistItem) => {
    setReportingItem(item);
    setFindings(item.findings || '');
    setImpression(item.impression || '');
  };

  const handleReleaseReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;

    StorageService.updateRadiologyReport(
      reportingItem.id,
      findings,
      impression,
      currentUser.name
    );

    setWorklist(StorageService.getRadiologyWorklist());
    refreshData();
    showToast(`Authorized radiology report released for ${reportingItem.patientName} (${reportingItem.modality})!`, 'success');

    openPrintDoc({
      type: 'radiology_report',
      title: `${reportingItem.modality} Radiology Report`,
      data: {
        ...reportingItem,
        findings,
        impression,
        reportedBy: currentUser.name
      }
    });

    setReportingItem(null);
  };

  const filteredWorklist = worklist.filter(item => {
    if (modalityFilter === 'all') return true;
    return item.modality.toLowerCase().includes(modalityFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" />
            <span>In-House Radiology & Diagnostic Imaging</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            USG • Digital X-Ray • Color Doppler • CT Scan • MRI • Authorized PACS Reports
          </p>
        </div>

        {/* Modality Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Modality:</span>
          <select
            value={modalityFilter}
            onChange={e => setModalityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Modalities</option>
            <option value="USG">Ultrasound (USG)</option>
            <option value="X-Ray">Digital X-Ray</option>
            <option value="Color Doppler">Color Doppler</option>
            <option value="CT Scan">CT Scan</option>
            <option value="MRI">MRI</option>
            <option value="Mammography">Mammography</option>
          </select>
        </div>
      </div>

      {/* Radiology Worklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Radiology Worklist ({filteredWorklist.length})</h3>
          <span className="text-xs text-slate-500">In-house Radiologist: Dr. M. K. Gupta</span>
        </div>

        <div className="space-y-3">
          {filteredWorklist.map(item => {
            const isReleased = item.status === 'authorized_released';

            return (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-900">
                      {item.modality}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.bodyPart}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Patient: <b>{item.patientName}</b> ({item.uhid}) • Prescribing Doctor: {item.prescribingDoctor}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Scheduled: {item.scheduledDate} • Fee: ₹{item.charge}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    isReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => handleOpenReportModal(item)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isReleased ? 'Edit / View Report' : 'Draft Report'}</span>
                  </button>

                  {isReleased && (
                    <button
                      onClick={() => {
                        openPrintDoc({
                          type: 'radiology_report',
                          title: `${item.modality} Radiology Report`,
                          data: item
                        });
                      }}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      title="Print Report"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Draft & Release Report Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {reportingItem.modality} Study Report — {reportingItem.patientName}
                </h3>
                <p className="text-xs text-slate-500">Anatomical Region: {reportingItem.bodyPart} • UHID: {reportingItem.uhid}</p>
              </div>
              <button onClick={() => setReportingItem(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleReleaseReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Findings *</label>
                <textarea
                  rows={5}
                  required
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder="Enter detailed radiological findings observed on scan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Impression / Clinical Conclusion *</label>
                <textarea
                  rows={2}
                  required
                  value={impression}
                  onChange={e => setImpression(e.target.value)}
                  placeholder="Final impression..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-950"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px] flex items-center justify-between">
                <span>Signing Clinician: <b>{currentUser.name}</b> (Radiologist)</span>
                <span>Role Protected Sign-off</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReportingItem(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Release Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
