import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PatientPortalView } from './components/patient-portal/PatientPortalView';
import { RegistrationModule } from './components/registration/RegistrationModule';
import { OpdModule } from './components/opd/OpdModule';
import { IpdModule } from './components/ipd/IpdModule';
import { EmergencyModule } from './components/emergency/EmergencyModule';
import { OtModule } from './components/ot/OtModule';
import { RadiologyModule } from './components/radiology/RadiologyModule';
import { LaboratoryModule } from './components/laboratory/LaboratoryModule';
import { PharmacyModule } from './components/pharmacy/PharmacyModule';
import { BillingModule } from './components/billing/BillingModule';
import { StaffModule } from './components/staff/StaffModule';
import { ExpensesTicketsModule } from './components/expenses-tickets/ExpensesTicketsModule';
import { DowntimeModule } from './components/downtime/DowntimeModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { AuditModule } from './components/audit/AuditModule';
import { PrintableDocument } from './components/print/PrintableDocument';

export const App: React.FC = () => {
  const { activeModule, toast } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border ${
            toast.type === 'success' ? 'bg-emerald-800 text-white border-emerald-700' :
            toast.type === 'error' ? 'bg-rose-800 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-800'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header />

      {/* Body Layout: Sidebar + Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && <AdminDashboard />}
          {activeModule === 'patient_portal' && <PatientPortalView />}
          {activeModule === 'registration' && <RegistrationModule />}
          {activeModule === 'opd' && <OpdModule />}
          {activeModule === 'ipd' && <IpdModule />}
          {activeModule === 'emergency' && <EmergencyModule />}
          {activeModule === 'ot' && <OtModule />}
          {activeModule === 'radiology' && <RadiologyModule />}
          {activeModule === 'laboratory' && <LaboratoryModule />}
          {activeModule === 'pharmacy' && <PharmacyModule />}
          {activeModule === 'billing' && <BillingModule />}
          {activeModule === 'staff' && <StaffModule />}
          {activeModule === 'expenses_tickets' && <ExpensesTicketsModule />}
          {activeModule === 'downtime' && <DowntimeModule />}
          {activeModule === 'reports' && <ReportsModule />}
          {activeModule === 'audit' && <AuditModule />}
        </main>
      </div>

      {/* Branded Printable Modal Overlay */}
      <PrintableDocument />
    </div>
  );
};
