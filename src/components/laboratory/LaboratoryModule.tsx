import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { LabTestItem } from '../../types';
import { FlaskConical, Barcode, CheckCircle2, Clock, Printer, ShieldCheck, X, ExternalLink } from 'lucide-react';

export const LaboratoryModule: React.FC = () => {
  const { refreshData, showToast, currentUser, openPrintDoc } = useApp();

  const [labTests, setLabTests] = useState<LabTestItem[]>(StorageService.getLabTests());
  const [filterMode, setFilterMode] = useState<'all' | 'in_house' | 'external_referral'>('all');

  // Result entry modal
  const [activeTest, setActiveTest] = useState<LabTestItem | null>(null);
  const [paramResults, setParamResults] = useState<Array<{ parameter: string; value: string; unit: string; normalRange: string; isAbnormal: boolean }>>([]);
  const [overallImpression, setOverallImpression] = useState('');

  const handleCollectSample = (test: LabTestItem) => {
    const barcodeId = `SPEC-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    StorageService.updateLabTestStatus(test.id, 'sample_collected', currentUser.name);
    
    // Update barcode
    const list = StorageService.getLabTests();
    const idx = list.findIndex(l => l.id === test.id);
    if (idx >= 0) {
      list[idx].specimenBarcodeId = barcodeId;
      localStorage.setItem('swastik_lab_v1', JSON.stringify(list));
    }

    setLabTests(StorageService.getLabTests());
    refreshData();
    showToast(`Specimen collected for ${test.patientName}! Barcode: ${barcodeId}`, 'success');
  };

  const handleOpenResults = (test: LabTestItem) => {
    setActiveTest(test);
    if (test.parameterResults && test.parameterResults.length > 0) {
      setParamResults(test.parameterResults);
    } else {
      // Default parameters based on test
      setParamResults([
        { parameter: 'Hemoglobin (Hb)', value: '12.4', unit: 'g/dL', normalRange: '12.0 - 15.5', isAbnormal: false },
        { parameter: 'Total Leukocyte Count (TLC)', value: '7,800', unit: '/cu mm', normalRange: '4,000 - 11,000', isAbnormal: false },
        { parameter: 'Platelet Count', value: '2.4', unit: 'Lakhs/cu mm', normalRange: '1.5 - 4.5', isAbnormal: false }
      ]);
    }
    setOverallImpression(test.overallImpression || 'Parameters within acceptable physiological limits.');
  };

  const handleSaveAndAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest) return;

    StorageService.updateLabTestStatus(
      activeTest.id,
      'authorized_released',
      `${currentUser.name} (${currentUser.department})`,
      paramResults,
      overallImpression
    );

    setLabTests(StorageService.getLabTests());
    refreshData();
    showToast(`Authorized lab report released for ${activeTest.patientName}!`, 'success');

    openPrintDoc({
      type: 'lab_report',
      title: 'Pathology Diagnostic Test Report',
      data: {
        ...activeTest,
        parameterResults: paramResults,
        overallImpression,
        authorizedSignatory: currentUser.name
      }
    });

    setActiveTest(null);
  };

  const filteredTests = labTests.filter(t => {
    if (filterMode === 'all') return true;
    return t.processingLocation === filterMode;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <span>Pathology Laboratory & Diagnostic Investigation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable In-House Processing & External Partner Referrals • Barcode Sample Tracking • Role Sign-Off
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Processing Mode:</span>
          <select
            value={filterMode}
            onChange={e => setFilterMode(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Investigations</option>
            <option value="in_house">In-House Processing Only</option>
            <option value="external_referral">External Referral Partners</option>
          </select>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Diagnostic Orders Worklist ({filteredTests.length})</h3>
          <span className="text-xs text-slate-500">Dual Processing Architecture</span>
        </div>

        <div className="space-y-3">
          {filteredTests.map(test => {
            const isReleased = test.status === 'authorized_released';
            const isExternal = test.processingLocation === 'external_referral';

            return (
              <div key={test.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isExternal ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {isExternal ? 'External Referral' : 'In-House Lab'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{test.testName}</h4>
                  </div>
                  
                  <p className="text-xs text-slate-600 mt-1">
                    Patient: <b>{test.patientName}</b> ({test.uhid}) • Specimen: <b>{test.specimenType}</b>
                  </p>
                  
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Barcode: <b className="font-mono text-teal-800">{test.specimenBarcodeId || 'Pending collection'}</b></span>
                    <span>•</span>
                    <span>Fee: ₹{test.fee}</span>
                    {test.externalLabPartner && (
                      <>
                        <span>•</span>
                        <span className="text-purple-700 font-semibold">{test.externalLabPartner}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    isReleased ? 'bg-emerald-100 text-emerald-800' :
                    test.status === 'sample_collected' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {test.status.replace('_', ' ')}
                  </span>

                  {test.status === 'ordered' && (
                    <button
                      onClick={() => handleCollectSample(test)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Collect Sample</span>
                    </button>
                  )}

                  {['sample_collected', 'processing'].includes(test.status) && (
                    <button
                      onClick={() => handleOpenResults(test)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enter Results</span>
                    </button>
                  )}

                  {isReleased && (
                    <button
                      onClick={() => {
                        openPrintDoc({
                          type: 'lab_report',
                          title: 'Diagnostic Pathology Test Report',
                          data: test
                        });
                      }}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      title="Print Official Lab Report"
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

      {/* Enter Results & Authorize Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enter Results — {activeTest.testName}</h3>
                <p className="text-xs text-slate-500">Patient: {activeTest.patientName} • Specimen Barcode: {activeTest.specimenBarcodeId}</p>
              </div>
              <button onClick={() => setActiveTest(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveAndAuthorize} className="space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Observed Value</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5 text-center">Abnormal?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paramResults.map((pr, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-900">{pr.parameter}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={pr.value}
                            onChange={(e) => {
                              const updated = [...paramResults];
                              updated[idx].value = e.target.value;
                              setParamResults(updated);
                            }}
                            className="w-24 px-2 py-1 rounded border border-slate-300 font-bold"
                          />
                        </td>
                        <td className="p-2.5 text-slate-500">{pr.unit}</td>
                        <td className="p-2.5 text-slate-500">{pr.normalRange}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={pr.isAbnormal}
                            onChange={(e) => {
                              const updated = [...paramResults];
                              updated[idx].isAbnormal = e.target.checked;
                              setParamResults(updated);
                            }}
                            className="rounded text-rose-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pathologist Overall Impression</label>
                <textarea
                  rows={2}
                  value={overallImpression}
                  onChange={e => setOverallImpression(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px] flex justify-between items-center">
                <span>Authorized Signatory: <b>{currentUser.name}</b></span>
                <span>Traceable Audit Log</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveTest(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Release Result</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
