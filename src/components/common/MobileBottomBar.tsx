import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Stethoscope, BedDouble, Receipt, Menu, AlertOctagon 
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { 
    activeModule, setActiveModule, isMobileMenuOpen, setMobileMenuOpen,
    emergencyCases, queueTokens, beds
  } = useApp();

  const activeEmergencies = emergencyCases.filter(e => e.status === 'active').length;
  const activeQueueCount = queueTokens.filter(q => ['waiting', 'called', 'in_consultation'].includes(q.status)).length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around safe-bottom">
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveModule('dashboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          activeModule === 'dashboard' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Home</span>
      </button>

      {/* 2. OPD Queue */}
      <button
        onClick={() => setActiveModule('opd')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition relative ${
          activeModule === 'opd' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Stethoscope className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">OPD</span>
        {activeQueueCount > 0 && (
          <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
        )}
      </button>

      {/* 3. IPD Beds */}
      <button
        onClick={() => setActiveModule('ipd')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          activeModule === 'ipd' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <BedDouble className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">{occupiedBeds}/35 Beds</span>
      </button>

      {/* 4. Billing */}
      <button
        onClick={() => setActiveModule('billing')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          activeModule === 'billing' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Receipt className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Billing</span>
      </button>

      {/* 5. All Modules / Menu Drawer Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
          isMobileMenuOpen ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Modules</span>
        {activeEmergencies > 0 && (
          <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
        )}
      </button>
    </nav>
  );
};
