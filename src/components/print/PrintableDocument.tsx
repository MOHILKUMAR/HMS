import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Printer, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const PrintableDocument: React.FC = () => {
  const { printableDoc, closePrintDoc, t } = useApp();

  if (!printableDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  const { type, title, data } = printableDoc;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-4 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Header Action Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-sm">Printable Hospital Document Preview — {title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={closePrintDoc}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Content */}
        <div className="p-8 sm:p-12 text-slate-800 text-xs sm:text-sm font-sans space-y-6 print:p-6">
          
          {/* Branded Hospital Letterhead */}
          <div className="border-b-2 border-teal-700 pb-5 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-teal-900 tracking-tight leading-none">
                  SWASTIK HOSPITAL
                </h1>
                <p className="text-xs font-semibold text-teal-700 mt-1">
                  स्वस्तिक अस्पताल • NABH Accredited Secondary Healthcare
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Plot 4, Institutional Area, Sector 12, Dwarka, New Delhi 110075
                </p>
                <p className="text-[10px] text-slate-400">
                  Reg No: DHS/NH/2024/SW-0881 • Phone: +91-11-2550-9900 • 24x7 Emergency: +91-98765-00100
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 font-bold uppercase tracking-wider text-xs">
                {title}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* DOCUMENT BODY ACCORDING TO TYPE */}

          {/* 1. PRESCRIPTION */}
          {type === 'prescription' && (
            <div className="space-y-6">
              {/* Patient Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Permanent UHID:</span>
                  <span className="font-bold text-slate-900">{data.uhid}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Patient Name:</span>
                  <span className="font-bold text-slate-900">{data.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Age / Gender:</span>
                  <span className="font-semibold text-slate-800">{data.age} yrs / {data.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Consulting Doctor:</span>
                  <span className="font-bold text-teal-800">{data.doctorName}</span>
                </div>
              </div>

              {/* Vitals & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Clinical Vitals</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-slate-400">BP:</span> <span className="font-semibold">{data.vitals?.bpSystolic}/{data.vitals?.bpDiastolic} mmHg</span></div>
                    <div><span className="text-slate-400">Pulse:</span> <span className="font-semibold">{data.vitals?.pulse} bpm</span></div>
                    <div><span className="text-slate-400">SpO2:</span> <span className="font-semibold">{data.vitals?.spO2}%</span></div>
                    <div><span className="text-slate-400">Temp:</span> <span className="font-semibold">{data.vitals?.temperature} °F</span></div>
                    <div><span className="text-slate-400">Weight:</span> <span className="font-semibold">{data.vitals?.weight} kg</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Provisional Diagnosis</h4>
                  <p className="font-bold text-slate-900 text-sm">{data.diagnosis || 'Clinical evaluation under progress'}</p>
                  {data.allergiesNoted && data.allergiesNoted.length > 0 && (
                    <p className="text-rose-600 font-semibold text-xs mt-1">
                      Known Allergies: {data.allergiesNoted.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Rx Table */}
              <div>
                <h4 className="font-bold text-sm text-teal-900 mb-2 flex items-center gap-1.5">
                  <span className="text-lg font-serif italic text-teal-700">℞</span> Prescribed Medications
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.prescriptions?.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                          <td className="p-2.5 text-slate-700">{item.dosage}</td>
                          <td className="p-2.5 font-semibold text-teal-700">{item.frequency}</td>
                          <td className="p-2.5 text-slate-700">{item.duration}</td>
                          <td className="p-2.5 text-slate-600 italic">{item.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Follow up & signature */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Next Follow-up Visit:</p>
                  <p className="text-sm font-bold text-teal-800">{data.followUpDate || 'After 7 days / SOS in emergency'}</p>
                </div>
                <div className="text-center">
                  <div className="w-44 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900 text-xs">{data.doctorName}</p>
                  <p className="text-[10px] text-slate-500">Authorized Clinician Signature</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. DISCHARGE SUMMARY */}
          {type === 'discharge_summary' && (
            <div className="space-y-6">
              <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-500 block">Admission ID:</span><span className="font-bold text-slate-900">{data.admissionId}</span></div>
                <div><span className="text-slate-500 block">Permanent UHID:</span><span className="font-bold text-slate-900">{data.uhid}</span></div>
                <div><span className="text-slate-500 block">Patient Name:</span><span className="font-bold text-slate-900">{data.patientName}</span></div>
                <div><span className="text-slate-500 block">Attending Doctor:</span><span className="font-bold text-teal-900">{data.attendingDoctorName}</span></div>
                <div><span className="text-slate-500 block">Admission Date:</span><span className="font-semibold text-slate-800">{new Date(data.admissionDate).toLocaleDateString()}</span></div>
                <div><span className="text-slate-500 block">Discharge Date:</span><span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span></div>
                <div><span className="text-slate-500 block">Ward / Bed:</span><span className="font-semibold text-slate-800">{data.wardName} ({data.bedNumber})</span></div>
                <div><span className="text-slate-500 block">Financial Settlement:</span><span className="font-bold text-emerald-700">Settled & Cleared</span></div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Primary Admission Reason & Diagnosis</h4>
                <p className="text-sm font-bold text-slate-900 p-3 rounded-lg bg-slate-50 border border-slate-200">{data.admissionReason}</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Clinical Discharge Authorization Notes</h4>
                <p className="text-xs text-slate-800 p-3 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                  {data.clinicalDischargeNotes || 'Patient recovered uneventfully. Vitals stable. Surgical site clean with healthy granulation. Patient and attendant educated on home medications and warning signs.'}
                </p>
              </div>

              <div className="pt-8 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clinically Authorized & Medically Fit for Discharge</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900 text-xs">{data.clinicalDischargeDoctor || data.attendingDoctorName}</p>
                  <p className="text-[10px] text-slate-500">Authorized Inpatient Consultant</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. INVOICE / RECEIPT */}
          {type === 'invoice_receipt' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-400 block">Invoice Number:</span><span className="font-bold text-slate-900">{data.id}</span></div>
                <div><span className="text-slate-400 block">Permanent UHID:</span><span className="font-bold text-slate-900">{data.uhid}</span></div>
                <div><span className="text-slate-400 block">Patient Name:</span><span className="font-bold text-slate-900">{data.patientName}</span></div>
                <div><span className="text-slate-400 block">Invoice Date:</span><span className="font-semibold text-slate-800">{data.date}</span></div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Service Description</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.lines?.map((line: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{line.description}</td>
                        <td className="p-2.5 uppercase text-[10px] text-slate-500 font-semibold">{line.category}</td>
                        <td className="p-2.5 text-right text-slate-700">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-center text-slate-700">{line.quantity}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{line.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="p-2.5 text-right text-slate-600">Subtotal:</td>
                      <td className="p-2.5 text-right">₹{data.subtotal?.toLocaleString('en-IN')}</td>
                    </tr>
                    {data.discountAmount > 0 && (
                      <tr>
                        <td colSpan={5} className="p-2 text-right text-emerald-700">Discount Approved:</td>
                        <td className="p-2 text-right text-emerald-700">-₹{data.discountAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr className="text-sm bg-teal-50 text-teal-950 font-black">
                      <td colSpan={5} className="p-3 text-right">Grand Total:</td>
                      <td className="p-3 text-right">₹{data.grandTotal?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-2 text-right text-emerald-700">Amount Paid / Received:</td>
                      <td className="p-2 text-right text-emerald-700 font-bold">₹{data.amountPaid?.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-2 text-right text-rose-700">Balance Due:</td>
                      <td className="p-2 text-right text-rose-700 font-bold">₹{data.balanceDue?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payments receipt audit */}
              {data.payments && data.payments.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                  <h5 className="font-bold text-emerald-900 mb-1">Payment Transactions Received</h5>
                  {data.payments.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>• {p.date} via {p.method?.toUpperCase()} (Ref: {p.transactionRef})</span>
                      <span className="font-bold">₹{p.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[11px] text-slate-500">
                  <p>Payment Mode: Self-Pay / Cash / UPI / Gateway</p>
                  <p>Computer-generated official receipt • Swastik Hospital</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900 text-xs">Cashier / Billing Desk</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. LAB REPORT */}
          {type === 'lab_report' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-400 block">Specimen Barcode:</span><span className="font-bold text-teal-800">{data.specimenBarcodeId}</span></div>
                <div><span className="text-slate-400 block">Test Name:</span><span className="font-bold text-slate-900">{data.testName}</span></div>
                <div><span className="text-slate-400 block">Processing Model:</span><span className="font-semibold text-slate-800 capitalize">{data.processingLocation?.replace('_', ' ')}</span></div>
                <div><span className="text-slate-400 block">Prescribed By:</span><span className="font-bold text-slate-900">{data.prescribingDoctor}</span></div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Investigation Parameter</th>
                      <th className="p-2.5">Observed Value</th>
                      <th className="p-2.5">Biological Reference Range</th>
                      <th className="p-2.5 text-center">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.parameterResults?.map((res: any, idx: number) => (
                      <tr key={idx} className={res.isAbnormal ? 'bg-amber-50/50' : ''}>
                        <td className="p-2.5 font-bold text-slate-900">{res.parameter}</td>
                        <td className={`p-2.5 font-bold ${res.isAbnormal ? 'text-rose-700' : 'text-slate-900'}`}>
                          {res.value} {res.unit}
                        </td>
                        <td className="p-2.5 text-slate-600">{res.normalRange}</td>
                        <td className="p-2.5 text-center">
                          {res.isAbnormal ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Abnormal</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.overallImpression && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h5 className="font-bold text-xs uppercase text-slate-500 mb-1">Pathologist Impression</h5>
                  <p className="text-xs text-slate-800 font-semibold">{data.overallImpression}</p>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <p className="text-[10px] text-slate-400">Specimen verified and analyzed under standardized laboratory protocols.</p>
                <div className="text-center">
                  <div className="w-52 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900 text-xs">{data.authorizedSignatory}</p>
                  <p className="text-[10px] text-slate-500">Authorized Pathologist / Signatory</p>
                </div>
              </div>
            </div>
          )}

          {/* 5. RADIOLOGY REPORT */}
          {type === 'radiology_report' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-400 block">Modality:</span><span className="font-bold text-teal-800">{data.modality}</span></div>
                <div><span className="text-slate-400 block">Anatomical Region:</span><span className="font-bold text-slate-900">{data.bodyPart}</span></div>
                <div><span className="text-slate-400 block">Patient Name:</span><span className="font-bold text-slate-900">{data.patientName}</span></div>
                <div><span className="text-slate-400 block">Prescribed By:</span><span className="font-bold text-slate-900">{data.prescribingDoctor}</span></div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Radiological Findings</h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                    {data.findings || 'No detailed findings recorded.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Impression / Conclusion</h4>
                  <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-lg leading-relaxed text-teal-950 font-bold whitespace-pre-line">
                    {data.impression || 'Normal study.'}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                <p className="text-[10px] text-slate-400">Digital PACS release • Swastik In-house Radiology Wing</p>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold text-slate-900 text-xs">{data.reportedBy || 'Dr. M. K. Gupta (Radiologist)'}</p>
                  <p className="text-[10px] text-slate-500">Consultant Radiologist</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. PATIENT ID CARD */}
          {type === 'patient_card' && (
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-teal-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-teal-300" />
                  <div>
                    <h3 className="font-black text-sm tracking-tight leading-none">SWASTIK HOSPITAL</h3>
                    <p className="text-[9px] text-teal-300 font-medium">Official Patient Identity Card</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600/50">
                  {data.uhid}
                </span>
              </div>

              <div className="py-4 grid grid-cols-3 gap-3 items-center">
                <div className="w-24 h-28 rounded-xl bg-teal-950/60 border border-teal-700 flex flex-col items-center justify-center text-teal-400">
                  <QrCode className="w-14 h-14" />
                  <span className="text-[8px] uppercase tracking-wider mt-1 text-slate-400">Digital QR</span>
                </div>
                <div className="col-span-2 space-y-1.5 text-xs">
                  <div>
                    <p className="text-[10px] text-teal-300">Patient Full Name</p>
                    <p className="font-bold text-sm text-white">{data.name}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-teal-300">Age / Gender</p>
                      <p className="font-semibold">{data.age} / {data.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-teal-300">Blood Group</p>
                      <p className="font-bold text-rose-400">{data.bloodGroup || 'O+'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-300">Registered Mobile</p>
                    <p className="font-mono font-semibold">{data.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-300">Emergency Contact</p>
                    <p className="font-medium text-[11px] text-slate-200">{data.emergencyContact?.name} ({data.emergencyContact?.relationship}): {data.emergencyContact?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-teal-700/60 flex items-center justify-between text-[9px] text-teal-200">
                <span>Please present this card at registration & billing counter</span>
                <span>24x7: 98765-00100</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
