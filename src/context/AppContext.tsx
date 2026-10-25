import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Patient, Bed, OpdQueueToken, EmergencyCase, Admission, Invoice } from '../types';
import { StorageService, AuditLogEntry } from '../services/storage';
import { ApiService } from '../services/api';
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

const GUEST_USER: User = {
  id: '',
  name: 'Unauthenticated User',
  email: '',
  mobile: '',
  role: 'guest' as any,
  department: 'Public',
  mfaEnabled: false,
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  activeModule: AppModule;
  setActiveModule: (module: AppModule) => void;
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
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
  const [currentUserState, setCurrentUserState] = useState<User | null>(() => {
    return ApiService.getStoredUser() || StorageService.getCurrentUser();
  });
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
    const user = ApiService.getStoredUser() || StorageService.getCurrentUser();
    if (user) setCurrentUserState(user);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('swastik_lang_v1', lang);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    StorageService.setCurrentUser(user);
    if (!user) {
      ApiService.clearSession();
    }
  };

  const logout = () => {
    ApiService.clearSession();
    setCurrentUserState(null);
    StorageService.setCurrentUser(null);
    setActiveModule('dashboard');
    showToast('Signed out of Swastik HMS console', 'info');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Active account: ${user.name}`, 'info');
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

  const isAuthenticated = Boolean(currentUserState && currentUserState.id && ApiService.getToken());
  const currentUser = currentUserState || GUEST_USER;
  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeModule,
        setActiveModule,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        logout,
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
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
