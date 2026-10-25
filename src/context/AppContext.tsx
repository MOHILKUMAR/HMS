import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Patient, Bed, OpdQueueToken, EmergencyCase, Admission, Invoice } from '../types';
import { StorageService, AuditLogEntry } from '../services/storage';
import { translations } from './translations';

export type AppModule = 
  | 'dashboard'
  | 'patient_portal'
  | 'registration'
  | 'opd'
  | 'ipd'
  | 'emergency'
  | 'ot'
  | 'radiology'
  | 'laboratory'
  | 'pharmacy'
  | 'billing'
  | 'staff'
  | 'expenses_tickets'
  | 'downtime'
  | 'reports'
  | 'audit';

export interface PrintableDocData {
  type: 'prescription' | 'discharge_summary' | 'invoice_receipt' | 'lab_report' | 'radiology_report' | 'patient_card';
  title: string;
  data: any;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  currentUser: User;
  switchUser: (user: User) => void;
  availableUsers: User[];
  isDowntimeMode: boolean;
  setDowntimeMode: (enabled: boolean) => void;
  
  // Quick Live Stats
  beds: Bed[];
  queueTokens: OpdQueueToken[];
  emergencyCases: EmergencyCase[];
  admissions: Admission[];
  patients: Patient[];
  invoices: Invoice[];
  auditLogs: AuditLogEntry[];
  refreshData: () => void;

  // Print modal
  printableDoc: PrintableDocData | null;
  openPrintDoc: (doc: PrintableDocData) => void;
  closePrintDoc: () => void;

  // Alerts
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [currentUser, setCurrentUserState] = useState<User>(StorageService.getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isDowntimeMode, setDowntimeModeState] = useState<boolean>(false);

  // Live state
  const [beds, setBeds] = useState<Bed[]>([]);
  const [queueTokens, setQueueTokens] = useState<OpdQueueToken[]>([]);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Print doc modal
  const [printableDoc, setPrintableDoc] = useState<PrintableDocData | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshData = () => {
    setBeds(StorageService.getBeds());
    setQueueTokens(StorageService.getQueueTokens());
    setEmergencyCases(StorageService.getEmergencyCases());
    setAdmissions(StorageService.getAdmissions());
    setPatients(StorageService.getPatients());
    setInvoices(StorageService.getInvoices());
    setAuditLogs(StorageService.getAuditLogs());
    setAvailableUsers(StorageService.getUsers());
  };

  useEffect(() => {
    StorageService.init();
    refreshData();
    const savedLang = localStorage.getItem('swastik_lang_v1') as Language;
    if (savedLang) setLanguageState(savedLang);
    const user = StorageService.getCurrentUser();
    if (user) setCurrentUserState(user);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('swastik_lang_v1', lang);
  };

  const switchUser = (user: User) => {
    setCurrentUserState(user);
    StorageService.setCurrentUser(user);
    showToast(`Switched active user to ${user.name} (${user.department})`, 'info');
  };

  const setDowntimeMode = (enabled: boolean) => {
    setDowntimeModeState(enabled);
    if (enabled) {
      setActiveModule('downtime');
      showToast('⚠️ Manual Offline Outage Mode Activated! Direct cloud sync paused.', 'error');
    } else {
      showToast('Cloud connectivity restored! Remember to reconcile offline records.', 'success');
    }
  };

  const openPrintDoc = (doc: PrintableDocData) => {
    setPrintableDoc(doc);
  };

  const closePrintDoc = () => {
    setPrintableDoc(null);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeModule,
        setActiveModule,
        currentUser,
        switchUser,
        availableUsers,
        isDowntimeMode,
        setDowntimeMode,
        beds,
        queueTokens,
        emergencyCases,
        admissions,
        patients,
        invoices,
        auditLogs,
        refreshData,
        printableDoc,
        openPrintDoc,
        closePrintDoc,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
