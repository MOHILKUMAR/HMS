import React from 'react';
import { useApp, AppModule } from '../../context/AppContext';
import { 
  LayoutDashboard, Globe, UserPlus, Stethoscope, BedDouble, 
  AlertOctagon, Activity, Eye, FlaskConical, Pill, Receipt, 
  Users, WalletCards, FileSpreadsheet, BarChart3, ShieldAlert 
} from 'lucide-react';

interface NavItem {
  id: AppModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  category?: 'clinical' | 'operations' | 'admin';
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, t, queueTokens, emergencyCases, beds, invoices } = useApp();

  const activeQueueCount = queueTokens.filter(q => ['waiting', 'called', 'in_consultation'].includes(q.status)).length;
  const activeEmergencies = emergencyCases.filter(e => e.status === 'active').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const unpaidInvoices = invoices.filter(i => ['unpaid', 'partially_paid'].includes(i.status)).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'patient_portal', label: t.patientPortal, icon: Globe, badge: 'Portal', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'registration', label: t.registration, icon: UserPlus },
    { id: 'opd', label: t.opdQueue, icon: Stethoscope, badge: activeQueueCount > 0 ? activeQueueCount : undefined, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'ipd', label: t.ipdWard, icon: BedDouble, badge: `${occupiedBeds}/35`, badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'emergency', label: t.emergency, icon: AlertOctagon, badge: activeEmergencies > 0 ? activeEmergencies : undefined, badgeColor: 'bg-rose-500 text-white animate-pulse' },
    { id: 'ot', label: t.operationTheatre, icon: Activity },
    { id: 'radiology', label: t.radiology, icon: Eye },
    { id: 'laboratory', label: t.laboratory, icon: FlaskConical },
    { id: 'pharmacy', label: t.pharmacy, icon: Pill },
    { id: 'billing', label: t.billing, icon: Receipt, badge: unpaidInvoices > 0 ? unpaidInvoices : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'staff', label: t.staffRoster, icon: Users },
    { id: 'expenses_tickets', label: t.expenses, icon: WalletCards },
    { id: 'downtime', label: t.downtime, icon: FileSpreadsheet },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'audit', label: t.auditLogs, icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 min-h-[calc(100vh-5rem)]">
      <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-9rem)]">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Hospital Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-700/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hospital Footer info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-200">Swastik Hospital</p>
        <p className="text-[10px] text-slate-500">v1.0 • Single Hospital Monolith</p>
        <p className="text-[10px] text-teal-400 mt-1">Status: All Modules Connected</p>
      </div>
    </aside>
  );
};
