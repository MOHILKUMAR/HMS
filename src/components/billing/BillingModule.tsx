import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Invoice, InvoiceLine, PaymentMethod } from '../../types';
import { 
  Receipt, Plus, CreditCard, QrCode, Printer, CheckCircle2, 
  AlertCircle, ShieldCheck, X, DollarSign, Wallet
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { invoices, patients, refreshData, showToast, currentUser, openPrintDoc } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  
  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientUhid, setPatientUhid] = useState('SH-2026-00101');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState('');
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    {
      id: 'L-01',
      serviceId: 'SRV-001',
      description: 'Gynecology OPD Consultation (Dr. Vandana Jain)',
      category: 'opd',
      unitPrice: 600,
      quantity: 1,
      total: 600
    }
  ]);

  // Payment Recording Modal
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [txnRef, setTxnRef] = useState('');

  // Refund / Discount Authorization Modal
  const [refundInvoice, setRefundInvoice] = useState<Invoice | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Clinical recommendation discount');

  const catalog = StorageService.getCatalog();

  const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalReceived = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalBalanceDue = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const handleAddLine = () => {
    const item = catalog.find(c => c.id === selectedCatalogItem);
    if (!item) return;

    setInvoiceLines([
      ...invoiceLines,
      {
        id: `L-${Date.now()}`,
        serviceId: item.code,
        description: item.name,
        category: item.department,
        unitPrice: item.price,
        quantity: 1,
        total: item.price
      }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setInvoiceLines(invoiceLines.filter((_, i) => i !== idx));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.uhid === patientUhid);
    if (!patient || invoiceLines.length === 0) return;

    const subtotal = invoiceLines.reduce((acc, l) => acc + l.total, 0);

    const newInv = StorageService.createInvoice({
      uhid: patient.uhid,
      patientName: patient.name,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      lines: invoiceLines,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: subtotal,
      amountPaid: 0,
      balanceDue: subtotal,
      status: 'unpaid'
    });

    refreshData();
    setShowCreateModal(false);
    showToast(`Invoice ${newInv.id} created for ${patient.name}!`, 'success');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;

    try {
      StorageService.recordPayment(
        paymentInvoice.id,
        Number(paymentAmount),
        paymentMethod,
        txnRef || `TXN-${Date.now().toString().slice(-6)}`,
        `${currentUser.name} (${currentUser.department})`
      );

      refreshData();
      showToast(`Payment of ₹${paymentAmount} recorded successfully!`, 'success');
      
      const updated = StorageService.getInvoices().find(i => i.id === paymentInvoice.id);
      if (updated) {
        openPrintDoc({
          type: 'invoice_receipt',
          title: 'Official Payment Receipt & Bill',
          data: updated
        });
      }

      setPaymentInvoice(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApproveRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundInvoice || refundAmount <= 0) return;

    try {
      StorageService.approveRefund(
        refundInvoice.id,
        Number(refundAmount),
        refundReason,
        currentUser.role,
        currentUser.name
      );

      refreshData();
      showToast(`Refund / Discount of ₹${refundAmount} authorized by ${currentUser.name}!`, 'success');
      setRefundInvoice(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.uhid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>Centralized Billing & Cashier Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single bill catalog • Price snapshots • Itemized invoices • UPI QR / Gateway • Controlled refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Invoice or UHID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 w-48"
          />

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Bill</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Invoiced</span>
            <span className="text-2xl font-black text-slate-900">₹{totalBilled.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Total Collections</span>
            <span className="text-2xl font-black text-emerald-700">₹{totalReceived.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Outstanding Balance Due</span>
            <span className="text-2xl font-black text-rose-700">₹{totalBalanceDue.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-900">Hospital Billing Ledger ({filteredInvoices.length})</h3>
          <span className="text-xs text-slate-500">Self-Pay Baseline • Anti-Overwrite Protection</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Patient Name / UHID</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => {
                const isPaid = inv.status === 'paid';
                const isPartiallyPaid = inv.status === 'partially_paid';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-teal-800">{inv.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{inv.patientName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{inv.uhid}</p>
                    </td>
                    <td className="p-3 text-slate-600">{inv.date}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">₹{inv.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-rose-700">₹{inv.balanceDue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' :
                        isPartiallyPaid ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setPaymentInvoice(inv);
                              setPaymentAmount(inv.balanceDue);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}

                        {/* Authorize Refund / Discount */}
                        <button
                          onClick={() => {
                            setRefundInvoice(inv);
                            setRefundAmount(Math.min(500, inv.amountPaid));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                          title="Authorize Refund or Discount (Admin/Finance)"
                        >
                          Discount/Refund
                        </button>

                        {/* Print Bill */}
                        <button
                          onClick={() => {
                            openPrintDoc({
                              type: 'invoice_receipt',
                              title: 'Hospital Itemized Invoice & Official Receipt',
                              data: inv
                            });
                          }}
                          className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                          title="Print Invoice / Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal (With UPI QR & Card Simulation) */}
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Payment</h3>
                <p className="text-xs text-slate-500">Invoice: {paymentInvoice.id} • Balance: ₹{paymentInvoice.balanceDue}</p>
              </div>
              <button onClick={() => setPaymentInvoice(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-lg text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR Code' },
                    { id: 'cash', label: 'Cash at Counter' },
                    { id: 'card', label: 'Debit / Credit Card' },
                    { id: 'bank_transfer', label: 'Net Banking' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-center font-bold transition ${
                        paymentMethod === m.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-center space-y-2">
                  <p className="font-bold text-teal-950">Swastik Hospital Dynamic UPI QR</p>
                  <div className="w-24 h-24 bg-white border border-teal-300 rounded-xl mx-auto flex items-center justify-center text-teal-800">
                    <QrCode className="w-16 h-16" />
                  </div>
                  <p className="text-[10px] text-teal-800 font-mono">swastikhospital@hdfcbank • ₹{paymentAmount}</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cash Receipt No.</label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={e => setTxnRef(e.target.value)}
                  placeholder="e.g. UPI/20261025/12345 or CASH-101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPaymentInvoice(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Receipt & Print</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authorize Refund / Discount Modal */}
      {refundInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Authorize Refund / Discount</span>
            </h3>
            <p className="text-xs text-slate-500">
              Only Administrator or Finance Manager can authorize financial adjustments.
            </p>

            <form onSubmit={handleApproveRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund / Discount Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Audit Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="State clinical or management reason for discount/refund..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Approver: <b>{currentUser.name}</b> (Role: <span className="font-bold uppercase">{currentUser.role}</span>). This action will be permanently recorded in the immutable audit log.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRefundInvoice(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl">
                  Approve Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate New Bill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Generate Itemized Patient Invoice</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient UHID *</label>
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

              {/* Add line item from catalog */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-bold text-slate-700">Add Service from Unified Catalog</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCatalogItem}
                    onChange={e => setSelectedCatalogItem(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="">-- Select Catalog Service --</option>
                    {catalog.map(item => (
                      <option key={item.id} value={item.id}>{item.name} - ₹{item.price} ({item.department.toUpperCase()})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    + Add Line
                  </button>
                </div>
              </div>

              {/* Invoice Lines Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Service Description</th>
                      <th className="p-2.5">Dept</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceLines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-900">{line.description}</td>
                        <td className="p-2.5 uppercase text-[10px] text-slate-500 font-semibold">{line.category}</td>
                        <td className="p-2.5 text-right font-medium">₹{line.unitPrice}</td>
                        <td className="p-2.5 text-center">{line.quantity}</td>
                        <td className="p-2.5 text-right font-bold">₹{line.total}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right text-slate-600">Invoice Total:</td>
                      <td className="p-2.5 text-right text-teal-900 text-sm">
                        ₹{invoiceLines.reduce((acc, l) => acc + l.total, 0).toLocaleString('en-IN')}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-xl shadow-md">
                  Create Finalized Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
