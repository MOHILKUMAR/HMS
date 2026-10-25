export type Language = 'en' | 'hi';

export type UserRole = 
  | 'admin'
  | 'reception'
  | 'doctor_gynecologist' // Dr. Vandana Jain
  | 'doctor_anesthesiologist' // Dr. Ankit Jain
  | 'nurse'
  | 'ot_coordinator'
  | 'radiologist'
  | 'lab_technician'
  | 'pharmacist'
  | 'billing_cashier'
  | 'finance_manager'
  | 'support_manager'
  | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  department: string;
  mfaEnabled: boolean;
  avatar?: string;
}

export interface Patient {
  uhid: string; // Permanent UHID e.g. SH-2026-00101
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dob?: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup?: string;
  allergies: string[];
  history: string[];
  createdAt: string;
  isTemporaryEmergency?: boolean;
}

export type AppointmentStatus = 
  | 'pending_review' 
  | 'confirmed' 
  | 'rescheduled' 
  | 'cancelled' 
  | 'checked_in' 
  | 'completed' 
  | 'no_show';

export interface Appointment {
  id: string;
  uhid: string;
  patientName: string;
  patientMobile: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  slotTime: string;
  bookingType: 'routine' | 'special_referral';
  bookingSource: 'online_portal' | 'walk_in' | 'phone';
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export type QueueTokenStatus = 'waiting' | 'called' | 'in_consultation' | 'completed' | 'delayed';

export interface OpdQueueToken {
  id: string;
  tokenNumber: number;
  uhid: string;
  patientName: string;
  encounterId: string;
  doctorId: string;
  doctorName: string;
  status: QueueTokenStatus;
  checkInTime: string;
  calledTime?: string;
  consultationStartTime?: string;
  completedTime?: string;
  isEmergencyPriority?: boolean;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. 1-0-1
  duration: string; // e.g. 5 days
  instructions: string; // Before food / after food
}

export interface InvestigationOrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  type: 'radiology' | 'laboratory';
  notes?: string;
}

export interface ClinicalConsultation {
  id: string;
  encounterId: string;
  uhid: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaints: string;
  historyOfPresentIllness: string;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    pulse: number;
    temperature: number;
    spO2: number;
    weight: number;
  };
  allergiesNoted: string[];
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: PrescriptionItem[];
  investigations: InvestigationOrderItem[];
  followUpDate?: string;
  recommendedAdmission?: boolean;
  recommendedOtProcedure?: boolean;
  // Specialty Workflows
  gynecologyData?: {
    gravida: number;
    para: number;
    abortion: number;
    living: number;
    lmpDate: string;
    eddDate: string;
    gestationalAgeWeeks: number;
    ultrasoundFindings: string;
    fetalHeartRate: number;
  };
  anesthesiaData?: {
    mallampatiClass: 'Class I' | 'Class II' | 'Class III' | 'Class IV';
    asaGrade: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V' | 'ASA E';
    airwayAssessment: string;
    npoHours: number;
    anesthesiaPlan: 'General' | 'Spinal' | 'Epidural' | 'Local' | 'MAC';
    fitnessApproved: boolean;
  };
  finalized: boolean;
  finalizedAt?: string;
}

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'cleaning_blocked' | 'maintenance';
export type WardType = 'general_male' | 'general_female' | 'semi_private' | 'deluxe_private' | 'icu';

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  wardType: WardType;
  chargePerDay: number;
  status: BedStatus;
  currentAdmissionId?: string;
  currentPatientName?: string;
  currentUhid?: string;
}

export interface Admission {
  admissionId: string; // ADM-2026-XXXXX
  uhid: string;
  patientName: string;
  gender: string;
  age: number;
  bedId: string;
  bedNumber: string;
  wardName: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  admissionReason: string;
  attendantDetails: {
    name: string;
    phone: string;
    relation: string;
  };
  status: 'active' | 'transferred' | 'discharged';
  clinicalDischargeAuthorized: boolean;
  clinicalDischargeDoctor?: string;
  clinicalDischargeNotes?: string;
  dischargeDate?: string;
  financialSettled: boolean;
  bedHistory: Array<{
    bedId: string;
    bedNumber: string;
    wardName: string;
    from: string;
    to?: string;
  }>;
}

export interface InpatientVitalRecord {
  id: string;
  admissionId: string;
  uhid: string;
  recordedAt: string;
  recordedBy: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  temperature: number;
  spO2: number;
  respiratoryRate: number;
  nursingNotes: string;
}

export type MedicationAdminStatus = 'prescribed' | 'scheduled' | 'administered' | 'held' | 'documented';

export interface MedicationAdministrationRecord {
  id: string;
  admissionId: string;
  uhid: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: string;
  status: MedicationAdminStatus;
  notes?: string;
}

export type TriageCategory = 'red' | 'yellow' | 'green';
export type EmergencyDisposition = 'observation' | 'admitted_ipd' | 'transferred_out' | 'discharged';

export interface EmergencyCase {
  id: string;
  temporaryUhid: string;
  patientName: string;
  age: number;
  gender: string;
  arrivalTime: string;
  triage: TriageCategory; // Red = Immediate, Yellow = Urgent, Green = Non-urgent
  attendingDoctor: string;
  chiefComplaint: string;
  vitals: {
    bp: string;
    pulse: number;
    spO2: number;
    temp: number;
  };
  treatmentGiven: string;
  disposition: EmergencyDisposition;
  reconciledWithPermanentUhid?: string;
  status: 'active' | 'resolved';
}

export type OtCaseStatus = 'planned' | 'scheduled' | 'preparation' | 'in_progress' | 'completed' | 'cancelled';

export interface OtBooking {
  id: string;
  theatreName: string; // Theatre 1
  uhid: string;
  patientName: string;
  procedureName: string;
  date: string;
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "12:00"
  durationMinutes: number;
  surgeonId: string;
  surgeonName: string;
  anesthesiologistId?: string; // Dr. Ankit Jain
  anesthesiologistName?: string;
  assistantStaff: string[];
  requiresAnesthesia: boolean;
  preOpChecked: boolean;
  status: OtCaseStatus;
  notes?: string;
}

export type DiagnosticOrderStatus = 'ordered' | 'sample_collected' | 'processing' | 'pending_review' | 'authorized_released' | 'cancelled';

export interface RadiologyWorklistItem {
  id: string;
  orderId: string;
  uhid: string;
  patientName: string;
  encounterId?: string;
  admissionId?: string;
  modality: 'USG' | 'X-Ray' | 'Color Doppler' | 'CT Scan' | 'MRI' | 'Mammography';
  bodyPart: string;
  prescribingDoctor: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'report_pending' | 'authorized_released';
  reportNotes?: string;
  findings?: string;
  impression?: string;
  reportedBy?: string;
  reportedAt?: string;
  charge: number;
}

export interface LabTestItem {
  id: string;
  orderId: string;
  uhid: string;
  patientName: string;
  testCode: string;
  testName: string;
  category: string;
  processingLocation: 'in_house' | 'external_referral';
  externalLabPartner?: string;
  specimenType: string;
  specimenBarcodeId?: string;
  prescribingDoctor: string;
  orderedAt: string;
  status: DiagnosticOrderStatus;
  parameterResults?: Array<{
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    isAbnormal: boolean;
  }>;
  overallImpression?: string;
  authorizedSignatory?: string;
  authorizedAt?: string;
  fee: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: 'tablet' | 'syrup' | 'injection' | 'consumable' | 'surgical_supply';
  unit: string;
  batches: Array<{
    batchNumber: string;
    expiryDate: string; // YYYY-MM-DD
    currentStock: number;
    mrp: number;
    purchaseRate: number;
    supplier: string;
  }>;
  totalStock: number;
  reorderLevel: number;
}

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  department: 'opd' | 'ipd' | 'radiology' | 'laboratory' | 'ot' | 'pharmacy';
  price: number;
  isActive: boolean;
  taxPercent: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'online_gateway';

export interface InvoiceLine {
  id: string;
  serviceId: string;
  description: string;
  category: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string; // INV-2026-XXXXX
  uhid: string;
  patientName: string;
  encounterId?: string;
  admissionId?: string;
  date: string;
  lines: InvoiceLine[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  discountApprovedBy?: string;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
  payments: Array<{
    paymentId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef: string;
    date: string;
    receivedBy: string;
  }>;
  refunds: Array<{
    refundId: string;
    amount: number;
    reason: string;
    approvedBy: string;
    date: string;
  }>;
}

export interface HospitalExpense {
  id: string;
  date: string;
  category: 'medical_supplies' | 'equipment_maintenance' | 'utilities' | 'staff_honorarium' | 'cleaning_sanitation' | 'pharmacy_stock';
  supplierOrVendor: string;
  invoiceNumber: string;
  amount: number;
  paymentMode: 'cash' | 'bank_transfer' | 'cheque';
  status: 'pending_approval' | 'approved' | 'paid';
  approvedBy?: string;
  description: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  uhid?: string;
  patientName?: string;
  category: 'clinical' | 'billing' | 'nursing_ward' | 'facility' | 'it_software';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedToDepartment: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DowntimeManualRecord {
  id: string;
  tempReferenceId: string;
  patientName: string;
  phone: string;
  entryType: 'opd_walkin' | 'ipd_admission' | 'emergency';
  attendingStaff: string;
  serviceRendered: string;
  amountCollected: number;
  paymentMode: string;
  recordedTimestamp: string;
  reconciled: boolean;
  reconciledPermanentUhid?: string;
  reconciledInvoiceId?: string;
  reconciliationNotes?: string;
}
