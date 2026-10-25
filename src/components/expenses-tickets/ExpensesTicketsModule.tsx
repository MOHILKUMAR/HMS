import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { HospitalExpense, SupportTicket } from '../../types';
import { WalletCards, LifeBuoy, Plus, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';

export const ExpensesTicketsModule: React.FC = () => {
  const { refreshData, showToast, currentUser, patients } = useApp();

  const [expenses, setExpenses] = useState<HospitalExpense[]>(StorageService.getExpenses());
  const [tickets, setTickets] = useState<SupportTicket[]>(StorageService.getSupportTickets());

  const [activeTab, setActiveTab] = useState<'expenses' | 'tickets'>('expenses');

  // New Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<HospitalExpense['category']>('medical_supplies');
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer' | 'cheque'>('bank_transfer');
  const [expDesc, setExpDesc] = useState('');

  // New Ticket modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('facility');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('medium');
  const [ticketDept, setTicketDept] = useState('Maintenance & Housekeeping');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketUhid, setTicketUhid] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = StorageService.addExpense({
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      supplierOrVendor: supplier,
      invoiceNumber: invoiceNo,
      amount: Number(amount),
      paymentMode,
      status: 'pending_approval',
      description: expDesc
    });

    setExpenses(StorageService.getExpenses());
    refreshData();
    setShowExpenseModal(false);
    showToast(`Hospital expense of ₹${amount} logged and submitted for approval!`, 'success');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTck = StorageService.createSupportTicket({
      subject: ticketSubject,
      category: ticketCategory,
      priority: ticketPriority,
      assignedToDepartment: ticketDept,
      description: ticketDesc,
      status: 'open',
      uhid: ticketUhid || undefined,
      patientName: ticketUhid ? patients.find(p => p.uhid === ticketUhid)?.name : undefined
    });

    setTickets(StorageService.getSupportTickets());
    refreshData();
    setShowTicketModal(false);
    showToast(`Ticket ${newTck.ticketNumber} created and assigned to ${ticketDept}!`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-teal-600" />
            <span>Operating Expenses & Grievance Tickets Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital procurement costs • Vendor invoices • Patient complaints & Staff resolution tickets
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Hospital Expenses
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'tickets'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Support & Complaints Tickets
          </button>
        </div>
      </div>

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Hospital Operating Expenses ({expenses.length})</h3>
              <p className="text-xs text-slate-500">Separated from patient revenue accounts</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>

          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">₹{exp.amount.toLocaleString('en-IN')}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                      {exp.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      exp.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      exp.status === 'approved' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {exp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 font-semibold">Vendor: {exp.supplierOrVendor} (Inv #{exp.invoiceNumber})</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{exp.description}</p>
                </div>

                <div className="text-right text-slate-500 text-[11px]">
                  <p>Date: {exp.date}</p>
                  <p>Mode: {exp.paymentMode.toUpperCase()}</p>
                  {exp.approvedBy && <p className="text-teal-800 font-semibold">Approved by {exp.approvedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Grievance & Support Tickets ({tickets.length})</h3>
              <p className="text-xs text-slate-500">Patient complaints & internal facility service requests</p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map(tck => (
              <div key={tck.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {tck.ticketNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{tck.subject}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tck.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                      tck.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {tck.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1">{tck.description}</p>
                  {tck.patientName && (
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">Linked Patient: {tck.patientName} ({tck.uhid})</p>
                  )}
                  {tck.resolutionNotes && (
                    <p className="text-[11px] text-emerald-800 font-semibold mt-1">Resolution: {tck.resolutionNotes}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    tck.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    tck.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {tck.status.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Assigned: {tck.assignedToDepartment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Log Hospital Operating Expense</h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                  <option value="medical_supplies">Medical Supplies & Consumables</option>
                  <option value="equipment_maintenance">Equipment Maintenance & AMC</option>
                  <option value="utilities">Utilities (Electricity, Water, Oxygen)</option>
                  <option value="staff_honorarium">Staff Honorarium & Clinical Locum</option>
                  <option value="cleaning_sanitation">Cleaning, Linen & Bio-Waste</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                  <input type="text" required value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. GE Healthcare" className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                  <input type="text" required value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. INV-8821" className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" required min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Purpose</label>
                <textarea rows={2} required value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Purpose of expenditure..." className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Submit Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <h3 className="font-bold text-base text-slate-900">Raise Grievance / Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Issue Title *</label>
                <input type="text" required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="e.g. Ward 101 AC Cooling Issue" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="facility">Facility & Maintenance</option>
                    <option value="billing">Billing & Finance</option>
                    <option value="nursing_ward">Nursing & Ward Service</option>
                    <option value="it_software">IT / Software / Printer</option>
                    <option value="clinical">Clinical Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                <input type="text" value={ticketDept} onChange={e => setTicketDept(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea rows={3} required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTicketModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
