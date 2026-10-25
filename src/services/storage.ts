import {
  Patient, Bed, Appointment, OpdQueueToken, EmergencyCase,
  OtBooking, RadiologyWorklistItem, LabTestItem, InventoryItem,
  ServiceCatalogItem, Invoice, User, Admission, InpatientVitalRecord,
  MedicationAdministrationRecord, HospitalExpense, SupportTicket, DowntimeManualRecord,
  ClinicalConsultation, OtCaseStatus
} from '../types';

import {
  SEED_USERS, SEED_PATIENTS, SEED_BEDS, SEED_ADMISSIONS,
  SEED_INPATIENT_VITALS, SEED_MAR, SEED_APPOINTMENTS,
  SEED_QUEUE_TOKENS, SEED_EMERGENCY_CASES, SEED_OT_BOOKINGS,
  SEED_RADIOLOGY_WORKLIST, SEED_LAB_TESTS, SEED_INVENTORY,
  SEED_SERVICE_CATALOG, SEED_INVOICES, SEED_EXPENSES,
  SEED_SUPPORT_TICKETS, SEED_DOWNTIME_RECORDS
} from '../data/seedData';
import { ApiService } from './api';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operatorName: string;
  action: string;
  module: string;
  recordId: string;
  details: string;
}

const STORAGE_KEYS = {
  USERS: 'swastik_users_v1',
  PATIENTS: 'swastik_patients_v1',
  BEDS: 'swastik_beds_v1',
  ADMISSIONS: 'swastik_admissions_v1',
  VITALS: 'swastik_vitals_v1',
  MAR: 'swastik_mar_v1',
  APPOINTMENTS: 'swastik_appointments_v1',
  QUEUE: 'swastik_queue_v1',
  EMERGENCY: 'swastik_emergency_v1',
  OT: 'swastik_ot_v1',
  RADIOLOGY: 'swastik_radiology_v1',
  LAB: 'swastik_lab_v1',
  INVENTORY: 'swastik_inventory_v1',
  CATALOG: 'swastik_catalog_v1',
  INVOICES: 'swastik_invoices_v1',
  EXPENSES: 'swastik_expenses_v1',
  TICKETS: 'swastik_tickets_v1',
  DOWNTIME: 'swastik_downtime_v1',
  AUDIT: 'swastik_audit_logs_v1',
  CONSULTATIONS: 'swastik_consultations_v1',
  CURRENT_USER: 'swastik_current_user_v1',
  LANG: 'swastik_lang_v1'
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export class StorageService {
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setItem(STORAGE_KEYS.USERS, SEED_USERS);
      setItem(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
      setItem(STORAGE_KEYS.BEDS, SEED_BEDS);
      setItem(STORAGE_KEYS.ADMISSIONS, SEED_ADMISSIONS);
      setItem(STORAGE_KEYS.VITALS, SEED_INPATIENT_VITALS);
      setItem(STORAGE_KEYS.MAR, SEED_MAR);
      setItem(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
      setItem(STORAGE_KEYS.QUEUE, SEED_QUEUE_TOKENS);
      setItem(STORAGE_KEYS.EMERGENCY, SEED_EMERGENCY_CASES);
      setItem(STORAGE_KEYS.OT, SEED_OT_BOOKINGS);
      setItem(STORAGE_KEYS.RADIOLOGY, SEED_RADIOLOGY_WORKLIST);
      setItem(STORAGE_KEYS.LAB, SEED_LAB_TESTS);
      setItem(STORAGE_KEYS.INVENTORY, SEED_INVENTORY);
      setItem(STORAGE_KEYS.CATALOG, SEED_SERVICE_CATALOG);
      setItem(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      setItem(STORAGE_KEYS.EXPENSES, SEED_EXPENSES);
      setItem(STORAGE_KEYS.TICKETS, SEED_SUPPORT_TICKETS);
      setItem(STORAGE_KEYS.DOWNTIME, SEED_DOWNTIME_RECORDS);
      setItem(STORAGE_KEYS.AUDIT, [
        {
          id: 'AUD-001',
          timestamp: new Date().toISOString(),
          operatorName: 'System Initializer',
          action: 'SYSTEM_BOOTSTRAP',
          module: 'Core System',
          recordId: 'SYS',
          details: 'Swastik Hospital database initialized with 35 beds, seed clinical staff, and active encounters.'
        }
      ]);
      setItem(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]); // default to admin
    }
  }

  // AUDIT LOGGING
  static logAudit(operatorName: string, action: string, module: string, recordId: string, details: string): void {
    const logs = getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, []);
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operatorName,
      action,
      module,
      recordId,
      details
    };
    logs.unshift(entry);
    setItem(STORAGE_KEYS.AUDIT, logs.slice(0, 500)); // keep last 500
    try {
      ApiService.recordAudit(action, module, recordId, details);
    } catch {
      // offline safe
    }
  }

  static getAuditLogs(): AuditLogEntry[] {
    return getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, []);
  }

  // USERS & SESSIONS
  static getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  static getCurrentUser(): User | null {
    return ApiService.getStoredUser() || getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      setItem(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // PATIENTS
  static getPatients(): Patient[] {
    return getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  }

  static getPatientByUhid(uhid: string): Patient | undefined {
    return this.getPatients().find(p => p.uhid.toUpperCase() === uhid.toUpperCase());
  }

  static checkDuplicatePatients(phone: string, name: string): Patient[] {
    const list = this.getPatients();
    const cleanPhone = phone.trim();
    const cleanName = name.trim().toLowerCase();
    return list.filter(p => {
      const matchPhone = cleanPhone && p.mobile.includes(cleanPhone);
      const matchName = cleanName && p.name.toLowerCase().includes(cleanName);
      return matchPhone || matchName;
    });
  }

  static savePatient(patientData: Omit<Patient, 'uhid' | 'createdAt'> & { uhid?: string }): Patient {
    const patients = this.getPatients();
    let uhid = patientData.uhid;
    const isNew = !uhid;

    if (!uhid) {
      const seq = 101 + patients.length;
      uhid = `SH-2026-${seq.toString().padStart(5, '0')}`;
    }

    const patient: Patient = {
      ...patientData,
      uhid,
      createdAt: isNew ? new Date().toISOString() : (this.getPatientByUhid(uhid)?.createdAt || new Date().toISOString())
    };

    if (isNew) {
      patients.unshift(patient);
      this.logAudit('Staff', 'PATIENT_REGISTER', 'Registration', uhid, `Created permanent UHID ${uhid} for ${patient.name}`);
    } else {
      const idx = patients.findIndex(p => p.uhid === uhid);
      if (idx >= 0) {
        patients[idx] = patient;
        this.logAudit('Staff', 'PATIENT_UPDATE', 'Registration', uhid, `Updated patient profile for ${patient.name}`);
      }
    }

    setItem(STORAGE_KEYS.PATIENTS, patients);
    return patient;
  }

  // APPOINTMENTS
  static getAppointments(): Appointment[] {
    return getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  }

  static checkDoctorConflict(doctorId: string, date: string, slotTime: string, excludeId?: string): boolean {
    const appts = this.getAppointments();
    return appts.some(a => 
      a.id !== excludeId &&
      a.doctorId === doctorId && 
      a.date === date && 
      a.slotTime === slotTime && 
      !['cancelled', 'no_show'].includes(a.status)
    );
  }

  static bookAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'status'> & { instantConfirm?: boolean }): Appointment {
    const appts = this.getAppointments();
    const newId = `APT-2026-${(appts.length + 1).toString().padStart(3, '0')}`;
    
    // Check double booking
    if (this.checkDoctorConflict(data.doctorId, data.date, data.slotTime)) {
      throw new Error(`Doctor slot ${data.slotTime} on ${data.date} is already booked! Please select another slot.`);
    }

    // Hybrid booking: Routine is confirmed; Referral / Special is pending review
    const status = data.instantConfirm || data.bookingType === 'routine' ? 'confirmed' : 'pending_review';

    const newAppt: Appointment = {
      ...data,
      id: newId,
      status,
      createdAt: new Date().toISOString(),
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : undefined
    };

    appts.unshift(newAppt);
    setItem(STORAGE_KEYS.APPOINTMENTS, appts);
    this.logAudit(data.patientName, 'APPOINTMENT_BOOK', 'Scheduling', newId, `Booked ${data.slotTime} with ${data.doctorName} (Status: ${status})`);
    return newAppt;
  }

  static updateAppointmentStatus(id: string, status: Appointment['status'], operator: string): void {
    const appts = this.getAppointments();
    const idx = appts.findIndex(a => a.id === id);
    if (idx >= 0) {
      appts[idx].status = status;
      setItem(STORAGE_KEYS.APPOINTMENTS, appts);
      this.logAudit(operator, 'APPOINTMENT_STATUS', 'Scheduling', id, `Changed appointment status to ${status}`);
    }
  }

  // OPD QUEUE
  static getQueueTokens(): OpdQueueToken[] {
    return getItem<OpdQueueToken[]>(STORAGE_KEYS.QUEUE, []);
  }

  static issueQueueToken(uhid: string, patientName: string, doctorId: string, doctorName: string, isEmergency = false): OpdQueueToken {
    const tokens = this.getQueueTokens();
    const doctorTokens = tokens.filter(t => t.doctorId === doctorId);
    const tokenNumber = doctorTokens.length + 1;
    const encounterId = `ENC-2026-${(Math.floor(Math.random() * 9000) + 1000)}`;

    const token: OpdQueueToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber,
      uhid,
      patientName,
      encounterId,
      doctorId,
      doctorName,
      status: 'waiting',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEmergencyPriority: isEmergency
    };

    tokens.push(token);
    setItem(STORAGE_KEYS.QUEUE, tokens);
    this.logAudit('Reception', 'QUEUE_TOKEN_ISSUED', 'OPD Queue', encounterId, `Token #${tokenNumber} issued to ${patientName} for ${doctorName}`);
    return token;
  }

  static updateQueueStatus(id: string, status: OpdQueueToken['status'], operator: string): void {
    const tokens = this.getQueueTokens();
    const idx = tokens.findIndex(t => t.id === id);
    if (idx >= 0) {
      tokens[idx].status = status;
      if (status === 'called') {
        tokens[idx].calledTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'in_consultation') {
        tokens[idx].consultationStartTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'completed') {
        tokens[idx].completedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      setItem(STORAGE_KEYS.QUEUE, tokens);
      this.logAudit(operator, 'QUEUE_STATUS_CHANGE', 'OPD Queue', id, `Token state changed to ${status}`);
    }
  }

  // CLINICAL CONSULTATIONS
  static getConsultations(): ClinicalConsultation[] {
    return getItem<ClinicalConsultation[]>(STORAGE_KEYS.CONSULTATIONS, []);
  }

  static saveConsultation(consultation: ClinicalConsultation, operator: string): void {
    const list = this.getConsultations();
    const idx = list.findIndex(c => c.id === consultation.id);
    if (idx >= 0) {
      list[idx] = consultation;
    } else {
      list.unshift(consultation);
    }
    setItem(STORAGE_KEYS.CONSULTATIONS, list);
    this.logAudit(operator, 'CONSULTATION_SAVED', 'Clinical OPD', consultation.encounterId, `Consultation notes saved for UHID ${consultation.uhid}`);
  }

  // BEDS & IPD
  static getBeds(): Bed[] {
    return getItem<Bed[]>(STORAGE_KEYS.BEDS, SEED_BEDS);
  }

  static updateBedStatus(bedId: string, status: Bed['status'], patientInfo?: { admissionId?: string; patientName?: string; uhid?: string }): void {
    const beds = this.getBeds();
    const idx = beds.findIndex(b => b.id === bedId);
    if (idx >= 0) {
      beds[idx].status = status;
      if (status === 'occupied' && patientInfo) {
        beds[idx].currentAdmissionId = patientInfo.admissionId;
        beds[idx].currentPatientName = patientInfo.patientName;
        beds[idx].currentUhid = patientInfo.uhid;
      } else if (['available', 'cleaning_blocked', 'maintenance'].includes(status)) {
        delete beds[idx].currentAdmissionId;
        delete beds[idx].currentPatientName;
        delete beds[idx].currentUhid;
      }
      setItem(STORAGE_KEYS.BEDS, beds);
    }
  }

  static getAdmissions(): Admission[] {
    return getItem<Admission[]>(STORAGE_KEYS.ADMISSIONS, SEED_ADMISSIONS);
  }

  static admitPatient(data: Omit<Admission, 'admissionId' | 'status' | 'clinicalDischargeAuthorized' | 'financialSettled' | 'bedHistory'>): Admission {
    const admissions = this.getAdmissions();
    const admissionId = `ADM-2026-${(admissions.length + 45).toString().padStart(5, '0')}`;

    const newAdmission: Admission = {
      ...data,
      admissionId,
      status: 'active',
      clinicalDischargeAuthorized: false,
      financialSettled: false,
      bedHistory: [
        {
          bedId: data.bedId,
          bedNumber: data.bedNumber,
          wardName: data.wardName,
          from: new Date().toISOString()
        }
      ]
    };

    admissions.unshift(newAdmission);
    setItem(STORAGE_KEYS.ADMISSIONS, admissions);
    this.updateBedStatus(data.bedId, 'occupied', {
      admissionId,
      patientName: data.patientName,
      uhid: data.uhid
    });

    this.logAudit(data.attendingDoctorName, 'IPD_ADMISSION', 'IPD Ward', admissionId, `Admitted ${data.patientName} to Bed ${data.bedNumber} (${data.wardName})`);
    return newAdmission;
  }

  static transferBed(admissionId: string, targetBedId: string, operator: string): void {
    const admissions = this.getAdmissions();
    const admIdx = admissions.findIndex(a => a.admissionId === admissionId);
    if (admIdx < 0) throw new Error('Admission record not found');

    const beds = this.getBeds();
    const targetBed = beds.find(b => b.id === targetBedId);
    if (!targetBed || targetBed.status !== 'available') throw new Error('Target bed is not available');

    const oldBedId = admissions[admIdx].bedId;

    // Release old bed to cleaning
    this.updateBedStatus(oldBedId, 'cleaning_blocked');

    // Assign new bed
    this.updateBedStatus(targetBedId, 'occupied', {
      admissionId,
      patientName: admissions[admIdx].patientName,
      uhid: admissions[admIdx].uhid
    });

    // Update admission record
    admissions[admIdx].bedId = targetBed.id;
    admissions[admIdx].bedNumber = targetBed.bedNumber;
    admissions[admIdx].wardName = targetBed.wardName;
    admissions[admIdx].bedHistory.push({
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      wardName: targetBed.wardName,
      from: new Date().toISOString()
    });

    setItem(STORAGE_KEYS.ADMISSIONS, admissions);
    this.logAudit(operator, 'BED_TRANSFER', 'IPD Ward', admissionId, `Transferred patient from Bed ${oldBedId} to ${targetBed.bedNumber}`);
  }

  static authorizeClinicalDischarge(admissionId: string, doctorName: string, dischargeNotes: string): void {
    const admissions = this.getAdmissions();
    const idx = admissions.findIndex(a => a.admissionId === admissionId);
    if (idx >= 0) {
      admissions[idx].clinicalDischargeAuthorized = true;
      admissions[idx].clinicalDischargeDoctor = doctorName;
      admissions[idx].clinicalDischargeNotes = dischargeNotes;
      setItem(STORAGE_KEYS.ADMISSIONS, admissions);
      this.logAudit(doctorName, 'CLINICAL_DISCHARGE_AUTH', 'IPD Ward', admissionId, `Clinical discharge authorized by ${doctorName}`);
    }
  }

  static finalizeDischarge(admissionId: string, operator: string): void {
    const admissions = this.getAdmissions();
    const idx = admissions.findIndex(a => a.admissionId === admissionId);
    if (idx >= 0) {
      if (!admissions[idx].clinicalDischargeAuthorized) {
        throw new Error('Clinical discharge has not been authorized by attending doctor!');
      }
      admissions[idx].status = 'discharged';
      admissions[idx].dischargeDate = new Date().toISOString();
      admissions[idx].financialSettled = true;

      // release bed to cleaning
      this.updateBedStatus(admissions[idx].bedId, 'cleaning_blocked');

      setItem(STORAGE_KEYS.ADMISSIONS, admissions);
      this.logAudit(operator, 'PATIENT_DISCHARGED', 'IPD Ward', admissionId, `Patient discharged and Bed ${admissions[idx].bedNumber} marked for cleaning`);
    }
  }

  // INPATIENT VITALS & MAR
  static getInpatientVitals(admissionId?: string): InpatientVitalRecord[] {
    const list = getItem<InpatientVitalRecord[]>(STORAGE_KEYS.VITALS, SEED_INPATIENT_VITALS);
    if (admissionId) return list.filter(v => v.admissionId === admissionId);
    return list;
  }

  static recordInpatientVital(record: Omit<InpatientVitalRecord, 'id'>): InpatientVitalRecord {
    const list = this.getInpatientVitals();
    const newRecord: InpatientVitalRecord = {
      ...record,
      id: `VIT-${Date.now()}`
    };
    list.unshift(newRecord);
    setItem(STORAGE_KEYS.VITALS, list);
    return newRecord;
  }

  static getMarRecords(admissionId?: string): MedicationAdministrationRecord[] {
    const list = getItem<MedicationAdministrationRecord[]>(STORAGE_KEYS.MAR, SEED_MAR);
    if (admissionId) return list.filter(m => m.admissionId === admissionId);
    return list;
  }

  static updateMarStatus(id: string, status: MedicationAdministrationRecord['status'], administeredBy: string, notes?: string): void {
    const list = this.getMarRecords();
    const idx = list.findIndex(m => m.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      if (status === 'administered') {
        list[idx].administeredTime = new Date().toISOString();
        list[idx].administeredBy = administeredBy;
      }
      if (notes) list[idx].notes = notes;
      setItem(STORAGE_KEYS.MAR, list);
      this.logAudit(administeredBy, 'MAR_UPDATE', 'Nursing MAR', id, `Medication status updated to ${status}`);
    }
  }

  // EMERGENCY
  static getEmergencyCases(): EmergencyCase[] {
    return getItem<EmergencyCase[]>(STORAGE_KEYS.EMERGENCY, SEED_EMERGENCY_CASES);
  }

  static saveEmergencyCase(data: Omit<EmergencyCase, 'id' | 'temporaryUhid' | 'arrivalTime'>): EmergencyCase {
    const list = this.getEmergencyCases();
    const tempId = `EMG-TMP-${Math.floor(Math.random() * 9000) + 1000}`;
    const newCase: EmergencyCase = {
      ...data,
      id: `EMG-${Date.now()}`,
      temporaryUhid: tempId,
      arrivalTime: new Date().toISOString()
    };
    list.unshift(newCase);
    setItem(STORAGE_KEYS.EMERGENCY, list);
    this.logAudit('Triage Staff', 'EMERGENCY_ARRIVAL', 'Emergency Triage', tempId, `Emergency triage ${data.triage.toUpperCase()} for ${data.patientName}`);
    return newCase;
  }

  // OPERATION THEATRE (OT)
  static getOtBookings(): OtBooking[] {
    return getItem<OtBooking[]>(STORAGE_KEYS.OT, SEED_OT_BOOKINGS);
  }

  static checkOtConflict(date: string, startTime: string, endTime: string, surgeonId: string, anesthesiologistId?: string, excludeId?: string): { hasConflict: boolean; reason?: string } {
    const bookings = this.getOtBookings();
    
    // Simple time overlap check
    const isOverlapping = (s1: string, e1: string, s2: string, e2: string) => {
      return (s1 < e2 && e1 > s2);
    };

    for (const b of bookings) {
      if (b.id === excludeId || b.status === 'cancelled') continue;
      if (b.date === date) {
        if (isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
          // Check OT Room 1 conflict (Single OT Launch)
          return {
            hasConflict: true,
            reason: `Operation Theatre 1 is already reserved for "${b.procedureName}" between ${b.startTime} - ${b.endTime}`
          };
        }
        if (b.surgeonId === surgeonId && isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
          return {
            hasConflict: true,
            reason: `Surgeon ${b.surgeonName} is already committed to another case at that time.`
          };
        }
        if (anesthesiologistId && b.anesthesiologistId === anesthesiologistId && isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
          return {
            hasConflict: true,
            reason: `Anesthesiologist Dr. Ankit Jain is already committed to another case at that time.`
          };
        }
      }
    }

    return { hasConflict: false };
  }

  static bookOtCase(caseData: Omit<OtBooking, 'id'>): OtBooking {
    const conflict = this.checkOtConflict(
      caseData.date, 
      caseData.startTime, 
      caseData.endTime, 
      caseData.surgeonId, 
      caseData.anesthesiologistId
    );

    if (conflict.hasConflict) {
      throw new Error(`OT Conflict: ${conflict.reason}`);
    }

    const bookings = this.getOtBookings();
    const newBooking: OtBooking = {
      ...caseData,
      id: `OTB-2026-${(bookings.length + 1).toString().padStart(2, '0')}`
    };

    bookings.unshift(newBooking);
    setItem(STORAGE_KEYS.OT, bookings);
    this.logAudit(caseData.surgeonName, 'OT_BOOKING', 'Operation Theatre', newBooking.id, `Booked OT for ${caseData.procedureName} on ${caseData.date} at ${caseData.startTime}`);
    return newBooking;
  }

  static updateOtStatus(id: string, status: OtCaseStatus, operator: string): void {
    const bookings = this.getOtBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx >= 0) {
      bookings[idx].status = status;
      setItem(STORAGE_KEYS.OT, bookings);
      this.logAudit(operator, 'OT_STATUS_CHANGE', 'Operation Theatre', id, `OT case status changed to ${status}`);
    }
  }

  // RADIOLOGY
  static getRadiologyWorklist(): RadiologyWorklistItem[] {
    return getItem<RadiologyWorklistItem[]>(STORAGE_KEYS.RADIOLOGY, SEED_RADIOLOGY_WORKLIST);
  }

  static updateRadiologyReport(id: string, findings: string, impression: string, reportedBy: string): void {
    const list = this.getRadiologyWorklist();
    const idx = list.findIndex(r => r.id === id);
    if (idx >= 0) {
      list[idx].findings = findings;
      list[idx].impression = impression;
      list[idx].reportedBy = reportedBy;
      list[idx].reportedAt = new Date().toISOString();
      list[idx].status = 'authorized_released';
      setItem(STORAGE_KEYS.RADIOLOGY, list);
      this.logAudit(reportedBy, 'RADIOLOGY_REPORT_RELEASE', 'Radiology', id, `Released authorized report for ${list[idx].modality}`);
    }
  }

  // LABORATORY
  static getLabTests(): LabTestItem[] {
    return getItem<LabTestItem[]>(STORAGE_KEYS.LAB, SEED_LAB_TESTS);
  }

  static updateLabTestStatus(id: string, status: LabTestItem['status'], operator: string, results?: LabTestItem['parameterResults'], impression?: string): void {
    const list = this.getLabTests();
    const idx = list.findIndex(l => l.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      if (results) list[idx].parameterResults = results;
      if (impression) list[idx].overallImpression = impression;
      if (status === 'authorized_released') {
        list[idx].authorizedSignatory = operator;
        list[idx].authorizedAt = new Date().toISOString();
      }
      setItem(STORAGE_KEYS.LAB, list);
      this.logAudit(operator, 'LAB_TEST_STATUS', 'Laboratory', id, `Lab test status updated to ${status}`);
    }
  }

  // PHARMACY & INVENTORY
  static getInventory(): InventoryItem[] {
    return getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, SEED_INVENTORY);
  }

  static dispenseMedicine(medicineId: string, batchNumber: string, quantity: number, uhid: string, operator: string): void {
    const inventory = this.getInventory();
    const medIdx = inventory.findIndex(m => m.id === medicineId);
    if (medIdx < 0) throw new Error('Medicine not found');

    const batchIdx = inventory[medIdx].batches.findIndex(b => b.batchNumber === batchNumber);
    if (batchIdx < 0) throw new Error('Batch not found');

    if (inventory[medIdx].batches[batchIdx].currentStock < quantity) {
      throw new Error(`Insufficient stock in Batch ${batchNumber}. Available: ${inventory[medIdx].batches[batchIdx].currentStock}`);
    }

    inventory[medIdx].batches[batchIdx].currentStock -= quantity;
    inventory[medIdx].totalStock = inventory[medIdx].batches.reduce((acc, b) => acc + b.currentStock, 0);

    setItem(STORAGE_KEYS.INVENTORY, inventory);
    this.logAudit(operator, 'PHARMACY_DISPENSE', 'Pharmacy', uhid, `Dispensed ${quantity} units of ${inventory[medIdx].name} (Batch ${batchNumber})`);
  }

  // SERVICE CATALOG & PRICING
  static getCatalog(): ServiceCatalogItem[] {
    return getItem<ServiceCatalogItem[]>(STORAGE_KEYS.CATALOG, SEED_SERVICE_CATALOG);
  }

  // BILLING & INVOICES
  static getInvoices(): Invoice[] {
    return getItem<Invoice[]>(STORAGE_KEYS.INVOICES, SEED_INVOICES);
  }

  static createInvoice(data: Omit<Invoice, 'id' | 'payments' | 'refunds'>): Invoice {
    const list = this.getInvoices();
    const id = `INV-2026-${(list.length + 403).toString().padStart(5, '0')}`;
    const newInvoice: Invoice = {
      ...data,
      id,
      payments: [],
      refunds: []
    };
    list.unshift(newInvoice);
    setItem(STORAGE_KEYS.INVOICES, list);
    this.logAudit('Billing Desk', 'INVOICE_CREATE', 'Central Billing', id, `Invoice generated for ${data.patientName} (Total: ₹${data.grandTotal})`);
    return newInvoice;
  }

  static recordPayment(invoiceId: string, amount: number, method: Invoice['payments'][0]['method'], transactionRef: string, operator: string): void {
    const list = this.getInvoices();
    const idx = list.findIndex(i => i.id === invoiceId);
    if (idx < 0) throw new Error('Invoice not found');

    const inv = list[idx];
    const newPayment = {
      paymentId: `PAY-${Date.now()}`,
      amount,
      method,
      transactionRef: transactionRef || `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      receivedBy: operator
    };

    inv.payments.push(newPayment);
    inv.amountPaid += amount;
    inv.balanceDue = Math.max(0, inv.grandTotal - inv.amountPaid);
    inv.status = inv.balanceDue === 0 ? 'paid' : 'partially_paid';

    setItem(STORAGE_KEYS.INVOICES, list);
    this.logAudit(operator, 'PAYMENT_RECEIPT', 'Central Billing', invoiceId, `Payment of ₹${amount} received via ${method.toUpperCase()} (${newPayment.transactionRef})`);
  }

  static approveRefund(invoiceId: string, amount: number, reason: string, approverRole: string, operator: string): void {
    if (!['admin', 'finance_manager'].includes(approverRole)) {
      throw new Error('Unauthorized: Only Administrator or Finance Manager can authorize financial refunds/discounts.');
    }

    const list = this.getInvoices();
    const idx = list.findIndex(i => i.id === invoiceId);
    if (idx < 0) throw new Error('Invoice not found');

    const inv = list[idx];
    const newRefund = {
      refundId: `REF-${Date.now()}`,
      amount,
      reason,
      approvedBy: operator,
      date: new Date().toLocaleString()
    };

    inv.refunds.push(newRefund);
    inv.status = 'refunded';
    setItem(STORAGE_KEYS.INVOICES, list);
    this.logAudit(operator, 'REFUND_APPROVED', 'Central Billing', invoiceId, `Refund of ₹${amount} authorized. Reason: ${reason}`);
  }

  // EXPENSES & TICKETS
  static getExpenses(): HospitalExpense[] {
    return getItem<HospitalExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES);
  }

  static addExpense(data: Omit<HospitalExpense, 'id'>): HospitalExpense {
    const list = this.getExpenses();
    const newExp: HospitalExpense = {
      ...data,
      id: `EXP-2026-${(list.length + 1).toString().padStart(2, '0')}`
    };
    list.unshift(newExp);
    setItem(STORAGE_KEYS.EXPENSES, list);
    return newExp;
  }

  static getSupportTickets(): SupportTicket[] {
    return getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, SEED_SUPPORT_TICKETS);
  }

  static createSupportTicket(data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): SupportTicket {
    const list = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...data,
      id: `TCK-${Date.now()}`,
      ticketNumber: `SW-TCK-${1000 + list.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newTicket);
    setItem(STORAGE_KEYS.TICKETS, list);
    return newTicket;
  }

  // DOWNTIME REGISTER & RECONCILIATION
  static getDowntimeRecords(): DowntimeManualRecord[] {
    return getItem<DowntimeManualRecord[]>(STORAGE_KEYS.DOWNTIME, SEED_DOWNTIME_RECORDS);
  }

  static recordDowntimeEntry(data: Omit<DowntimeManualRecord, 'id' | 'reconciled'>): DowntimeManualRecord {
    const list = this.getDowntimeRecords();
    const entry: DowntimeManualRecord = {
      ...data,
      id: `DT-REC-${Date.now()}`,
      reconciled: false
    };
    list.unshift(entry);
    setItem(STORAGE_KEYS.DOWNTIME, list);
    return entry;
  }

  static reconcileDowntimeRecord(id: string, permanentUhid: string, invoiceId: string, notes: string, operator: string): void {
    const list = this.getDowntimeRecords();
    const idx = list.findIndex(r => r.id === id);
    if (idx >= 0) {
      list[idx].reconciled = true;
      list[idx].reconciledPermanentUhid = permanentUhid;
      list[idx].reconciledInvoiceId = invoiceId;
      list[idx].reconciliationNotes = notes;
      setItem(STORAGE_KEYS.DOWNTIME, list);
      this.logAudit(operator, 'DOWNTIME_RECONCILED', 'Outage Mode', id, `Reconciled manual record with Permanent UHID ${permanentUhid}`);
    }
  }
}
