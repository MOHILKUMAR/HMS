import { 
  Patient, Bed, Appointment, OpdQueueToken, EmergencyCase, 
  OtBooking, RadiologyWorklistItem, LabTestItem, InventoryItem, 
  ServiceCatalogItem, Invoice, User, Admission, InpatientVitalRecord,
  MedicationAdministrationRecord, HospitalExpense, SupportTicket, DowntimeManualRecord 
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Dr. Devendra Swastik',
    email: 'admin@swastikhospital.in',
    mobile: '9876543210',
    role: 'admin',
    department: 'Hospital Administration',
    mfaEnabled: true,
  },
  {
    id: 'DOC-001',
    name: 'Dr. Vandana Jain',
    email: 'vandana.jain@swastikhospital.in',
    mobile: '9876501001',
    role: 'doctor_gynecologist',
    department: 'Gynecology & Obstetrics',
    mfaEnabled: true,
  },
  {
    id: 'DOC-002',
    name: 'Dr. Ankit Jain',
    email: 'ankit.jain@swastikhospital.in',
    mobile: '9876501002',
    role: 'doctor_anesthesiologist',
    department: 'Anesthesiology & Critical Care',
    mfaEnabled: true,
  },
  {
    id: 'USR-003',
    name: 'Priya Sharma',
    email: 'reception@swastikhospital.in',
    mobile: '9876501003',
    role: 'reception',
    department: 'Front Desk & Appointments',
    mfaEnabled: false,
  },
  {
    id: 'USR-004',
    name: 'Sister Sunita Patel',
    email: 'nursing@swastikhospital.in',
    mobile: '9876501004',
    role: 'nurse',
    department: 'Inpatient Nursing',
    mfaEnabled: false,
  },
  {
    id: 'USR-005',
    name: 'Ramesh Verma',
    email: 'ot@swastikhospital.in',
    mobile: '9876501005',
    role: 'ot_coordinator',
    department: 'Operation Theatre',
    mfaEnabled: false,
  },
  {
    id: 'USR-006',
    name: 'Dr. M. K. Gupta',
    email: 'radiology@swastikhospital.in',
    mobile: '9876501006',
    role: 'radiologist',
    department: 'Radiology & Imaging',
    mfaEnabled: true,
  },
  {
    id: 'USR-007',
    name: 'Rajesh Kumar',
    email: 'lab@swastikhospital.in',
    mobile: '9876501007',
    role: 'lab_technician',
    department: 'Pathology & Lab',
    mfaEnabled: false,
  },
  {
    id: 'USR-008',
    name: 'Amit Shah',
    email: 'pharmacy@swastikhospital.in',
    mobile: '9876501008',
    role: 'pharmacist',
    department: 'Hospital Pharmacy',
    mfaEnabled: false,
  },
  {
    id: 'USR-009',
    name: 'Neha Mehra',
    email: 'billing@swastikhospital.in',
    mobile: '9876501009',
    role: 'billing_cashier',
    department: 'Central Billing',
    mfaEnabled: false,
  },
  {
    id: 'USR-010',
    name: 'Suresh Singhal',
    email: 'finance@swastikhospital.in',
    mobile: '9876501010',
    role: 'finance_manager',
    department: 'Finance & Accounts',
    mfaEnabled: true,
  },
  {
    id: 'USR-011',
    name: 'Anita Rao',
    email: 'support@swastikhospital.in',
    mobile: '9876501011',
    role: 'support_manager',
    department: 'Patient Grievance & Helpdesk',
    mfaEnabled: false,
  }
];

export const SEED_PATIENTS: Patient[] = [
  {
    uhid: 'SH-2026-00101',
    name: 'Sunita Aggarwal',
    age: 32,
    gender: 'Female',
    mobile: '9811223344',
    dob: '1994-06-15',
    address: 'B-14, Sector 6, Dwarka, New Delhi',
    emergencyContact: {
      name: 'Rakesh Aggarwal',
      relationship: 'Husband',
      phone: '9811223345'
    },
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    history: ['Previous LSCS in 2021', 'Gestational Hypertension'],
    createdAt: '2026-10-10T10:30:00Z'
  },
  {
    uhid: 'SH-2026-00102',
    name: 'Rajendra Singh',
    age: 58,
    gender: 'Male',
    mobile: '9822334455',
    dob: '1968-03-22',
    address: 'Flat 402, Shanti Kunj, Palam Colony',
    emergencyContact: {
      name: 'Virendra Singh',
      relationship: 'Son',
      phone: '9822334456'
    },
    bloodGroup: 'O+',
    allergies: ['Sulfa drugs'],
    history: ['Type 2 Diabetes', 'Hypertension'],
    createdAt: '2026-10-12T09:15:00Z'
  },
  {
    uhid: 'SH-2026-00103',
    name: 'Pooja Tiwari',
    age: 27,
    gender: 'Female',
    mobile: '9833445566',
    dob: '1999-11-04',
    address: 'House 12, Gali 3, Mahavir Enclave',
    emergencyContact: {
      name: 'Amit Tiwari',
      relationship: 'Husband',
      phone: '9833445567'
    },
    bloodGroup: 'A+',
    allergies: [],
    history: ['Primigravida 34 weeks'],
    createdAt: '2026-10-18T11:00:00Z'
  },
  {
    uhid: 'SH-2026-00104',
    name: 'Harish Chandra Gupta',
    age: 64,
    gender: 'Male',
    mobile: '9844556677',
    dob: '1962-08-19',
    address: 'Plot 77, Raj Nagar Extension',
    emergencyContact: {
      name: 'Sushila Gupta',
      relationship: 'Wife',
      phone: '9844556678'
    },
    bloodGroup: 'AB+',
    allergies: ['NSAIDs'],
    history: ['Chronic kidney disease stage 2', 'CAD post stent 2023'],
    createdAt: '2026-10-20T14:40:00Z'
  },
  {
    uhid: 'SH-2026-00105',
    name: 'Meena Kumari',
    age: 45,
    gender: 'Female',
    mobile: '9855667788',
    dob: '1981-01-30',
    address: 'C-31, Janakpuri, New Delhi',
    emergencyContact: {
      name: 'Dinesh Kumar',
      relationship: 'Brother',
      phone: '9855667789'
    },
    bloodGroup: 'O-',
    allergies: [],
    history: ['Uterine Fibroids', 'Anemia'],
    createdAt: '2026-10-22T16:20:00Z'
  }
];

export const SEED_BEDS: Bed[] = [
  // General Male Ward (10 beds)
  { id: 'BED-GM-01', bedNumber: 'GM-01', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'occupied', currentAdmissionId: 'ADM-2026-00041', currentPatientName: 'Rajendra Singh', currentUhid: 'SH-2026-00102' },
  { id: 'BED-GM-02', bedNumber: 'GM-02', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GM-03', bedNumber: 'GM-03', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GM-04', bedNumber: 'GM-04', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'cleaning_blocked' },
  { id: 'BED-GM-05', bedNumber: 'GM-05', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GM-06', bedNumber: 'GM-06', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GM-07', bedNumber: 'GM-07', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'occupied', currentAdmissionId: 'ADM-2026-00044', currentPatientName: 'Harish Chandra Gupta', currentUhid: 'SH-2026-00104' },
  { id: 'BED-GM-08', bedNumber: 'GM-08', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GM-09', bedNumber: 'GM-09', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'reserved' },
  { id: 'BED-GM-10', bedNumber: 'GM-10', wardId: 'W-GM', wardName: 'General Ward (Male)', wardType: 'general_male', chargePerDay: 1200, status: 'available' },

  // General Female Ward (10 beds)
  { id: 'BED-GF-01', bedNumber: 'GF-01', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'occupied', currentAdmissionId: 'ADM-2026-00042', currentPatientName: 'Pooja Tiwari', currentUhid: 'SH-2026-00103' },
  { id: 'BED-GF-02', bedNumber: 'GF-02', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-03', bedNumber: 'GF-03', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'occupied', currentAdmissionId: 'ADM-2026-00045', currentPatientName: 'Meena Kumari', currentUhid: 'SH-2026-00105' },
  { id: 'BED-GF-04', bedNumber: 'GF-04', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-05', bedNumber: 'GF-05', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-06', bedNumber: 'GF-06', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'maintenance' },
  { id: 'BED-GF-07', bedNumber: 'GF-07', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-08', bedNumber: 'GF-08', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-09', bedNumber: 'GF-09', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },
  { id: 'BED-GF-10', bedNumber: 'GF-10', wardId: 'W-GF', wardName: 'General Ward (Female)', wardType: 'general_female', chargePerDay: 1200, status: 'available' },

  // Semi-Private (8 beds)
  { id: 'BED-SP-01', bedNumber: 'SP-101A', wardId: 'W-SP', wardName: 'Semi-Private Room 101', wardType: 'semi_private', chargePerDay: 2500, status: 'occupied', currentAdmissionId: 'ADM-2026-00043', currentPatientName: 'Sunita Aggarwal', currentUhid: 'SH-2026-00101' },
  { id: 'BED-SP-02', bedNumber: 'SP-101B', wardId: 'W-SP', wardName: 'Semi-Private Room 101', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },
  { id: 'BED-SP-03', bedNumber: 'SP-102A', wardId: 'W-SP', wardName: 'Semi-Private Room 102', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },
  { id: 'BED-SP-04', bedNumber: 'SP-102B', wardId: 'W-SP', wardName: 'Semi-Private Room 102', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },
  { id: 'BED-SP-05', bedNumber: 'SP-103A', wardId: 'W-SP', wardName: 'Semi-Private Room 103', wardType: 'semi_private', chargePerDay: 2500, status: 'cleaning_blocked' },
  { id: 'BED-SP-06', bedNumber: 'SP-103B', wardId: 'W-SP', wardName: 'Semi-Private Room 103', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },
  { id: 'BED-SP-07', bedNumber: 'SP-104A', wardId: 'W-SP', wardName: 'Semi-Private Room 104', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },
  { id: 'BED-SP-08', bedNumber: 'SP-104B', wardId: 'W-SP', wardName: 'Semi-Private Room 104', wardType: 'semi_private', chargePerDay: 2500, status: 'available' },

  // Deluxe Private (4 rooms/beds)
  { id: 'BED-DP-01', bedNumber: 'DP-201', wardId: 'W-DP', wardName: 'Deluxe Suite 201', wardType: 'deluxe_private', chargePerDay: 5000, status: 'available' },
  { id: 'BED-DP-02', bedNumber: 'DP-202', wardId: 'W-DP', wardName: 'Deluxe Suite 202', wardType: 'deluxe_private', chargePerDay: 5000, status: 'reserved' },
  { id: 'BED-DP-03', bedNumber: 'DP-203', wardId: 'W-DP', wardName: 'Deluxe Suite 203', wardType: 'deluxe_private', chargePerDay: 5000, status: 'available' },
  { id: 'BED-DP-04', bedNumber: 'DP-204', wardId: 'W-DP', wardName: 'Deluxe Suite 204', wardType: 'deluxe_private', chargePerDay: 5000, status: 'available' },

  // ICU (3 beds)
  { id: 'BED-ICU-01', bedNumber: 'ICU-01', wardId: 'W-ICU', wardName: 'Intensive Care Unit', wardType: 'icu', chargePerDay: 7500, status: 'occupied', currentAdmissionId: 'ADM-2026-00044', currentPatientName: 'Harish Chandra Gupta', currentUhid: 'SH-2026-00104' },
  { id: 'BED-ICU-02', bedNumber: 'ICU-02', wardId: 'W-ICU', wardName: 'Intensive Care Unit', wardType: 'icu', chargePerDay: 7500, status: 'available' },
  { id: 'BED-ICU-03', bedNumber: 'ICU-03', wardId: 'W-ICU', wardName: 'Intensive Care Unit', wardType: 'icu', chargePerDay: 7500, status: 'available' },
];

export const SEED_ADMISSIONS: Admission[] = [
  {
    admissionId: 'ADM-2026-00043',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    gender: 'Female',
    age: 32,
    bedId: 'BED-SP-01',
    bedNumber: 'SP-101A',
    wardName: 'Semi-Private Room 101',
    attendingDoctorId: 'DOC-001',
    attendingDoctorName: 'Dr. Vandana Jain',
    admissionDate: '2026-10-24T08:30:00Z',
    expectedDischargeDate: '2026-10-27T12:00:00Z',
    admissionReason: 'Scheduled Elective Caesarean Section (Previous LSCS)',
    attendantDetails: {
      name: 'Rakesh Aggarwal',
      phone: '9811223345',
      relation: 'Husband'
    },
    status: 'active',
    clinicalDischargeAuthorized: false,
    financialSettled: false,
    bedHistory: [
      {
        bedId: 'BED-SP-01',
        bedNumber: 'SP-101A',
        wardName: 'Semi-Private Room 101',
        from: '2026-10-24T08:30:00Z'
      }
    ]
  },
  {
    admissionId: 'ADM-2026-00041',
    uhid: 'SH-2026-00102',
    patientName: 'Rajendra Singh',
    gender: 'Male',
    age: 58,
    bedId: 'BED-GM-01',
    bedNumber: 'GM-01',
    wardName: 'General Ward (Male)',
    attendingDoctorId: 'DOC-002',
    attendingDoctorName: 'Dr. Ankit Jain',
    admissionDate: '2026-10-23T14:00:00Z',
    expectedDischargeDate: '2026-10-26T10:00:00Z',
    admissionReason: 'Acute exacerbation of Diabetic Foot Cellulitis',
    attendantDetails: {
      name: 'Virendra Singh',
      phone: '9822334456',
      relation: 'Son'
    },
    status: 'active',
    clinicalDischargeAuthorized: true,
    clinicalDischargeDoctor: 'Dr. Ankit Jain',
    clinicalDischargeNotes: 'Wound clean, glycemic control achieved, oral antibiotics advised.',
    financialSettled: false,
    bedHistory: [
      {
        bedId: 'BED-GM-01',
        bedNumber: 'GM-01',
        wardName: 'General Ward (Male)',
        from: '2026-10-23T14:00:00Z'
      }
    ]
  }
];

export const SEED_INPATIENT_VITALS: InpatientVitalRecord[] = [
  {
    id: 'VIT-001',
    admissionId: 'ADM-2026-00043',
    uhid: 'SH-2026-00101',
    recordedAt: '2026-10-25T08:00:00Z',
    recordedBy: 'Sister Sunita Patel',
    bpSystolic: 124,
    bpDiastolic: 82,
    pulse: 78,
    temperature: 98.4,
    spO2: 99,
    respiratoryRate: 18,
    nursingNotes: 'Patient comfortable. Fetal heart sounds audible at 142 bpm. Hydration maintained.'
  },
  {
    id: 'VIT-002',
    admissionId: 'ADM-2026-00041',
    uhid: 'SH-2026-00102',
    recordedAt: '2026-10-25T08:30:00Z',
    recordedBy: 'Sister Sunita Patel',
    bpSystolic: 138,
    bpDiastolic: 86,
    pulse: 82,
    temperature: 99.1,
    spO2: 97,
    respiratoryRate: 19,
    nursingNotes: 'Dressing changed on right foot. No purulent discharge. Fasting blood sugar 132 mg/dL.'
  }
];

export const SEED_MAR: MedicationAdministrationRecord[] = [
  {
    id: 'MAR-001',
    admissionId: 'ADM-2026-00043',
    uhid: 'SH-2026-00101',
    medicineName: 'Inj. Cefuroxime 1.5g IV',
    dosage: '1.5 g IV stat',
    scheduledTime: '2026-10-25T09:00:00Z',
    administeredTime: '2026-10-25T09:05:00Z',
    administeredBy: 'Sister Sunita Patel',
    status: 'administered',
    notes: 'Skin test negative prior to injection'
  },
  {
    id: 'MAR-002',
    admissionId: 'ADM-2026-00043',
    uhid: 'SH-2026-00101',
    medicineName: 'Inj. Ranitidine 50mg IV',
    dosage: '50 mg IV',
    scheduledTime: '2026-10-25T09:00:00Z',
    administeredTime: '2026-10-25T09:10:00Z',
    administeredBy: 'Sister Sunita Patel',
    status: 'administered'
  },
  {
    id: 'MAR-003',
    admissionId: 'ADM-2026-00041',
    uhid: 'SH-2026-00102',
    medicineName: 'Inj. Human Actrapid Insulin',
    dosage: '8 Units Subcutaneously',
    scheduledTime: '2026-10-25T13:00:00Z',
    status: 'scheduled'
  }
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-2026-001',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    patientMobile: '9811223344',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    department: 'Gynecology & Obstetrics',
    date: '2026-10-25',
    slotTime: '10:00 AM',
    bookingType: 'routine',
    bookingSource: 'online_portal',
    status: 'checked_in',
    notes: 'Antenatal checkup 36th week',
    createdAt: '2026-10-24T18:00:00Z',
    confirmedAt: '2026-10-24T18:00:00Z'
  },
  {
    id: 'APT-2026-002',
    uhid: 'SH-2026-00103',
    patientName: 'Pooja Tiwari',
    patientMobile: '9833445566',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    department: 'Gynecology & Obstetrics',
    date: '2026-10-25',
    slotTime: '10:30 AM',
    bookingType: 'routine',
    bookingSource: 'walk_in',
    status: 'checked_in',
    notes: 'Severe pelvic discomfort',
    createdAt: '2026-10-25T09:00:00Z',
    confirmedAt: '2026-10-25T09:00:00Z'
  },
  {
    id: 'APT-2026-003',
    uhid: 'SH-2026-00104',
    patientName: 'Harish Chandra Gupta',
    patientMobile: '9844556677',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Ankit Jain',
    department: 'Anesthesiology & Critical Care',
    date: '2026-10-25',
    slotTime: '11:00 AM',
    bookingType: 'special_referral',
    bookingSource: 'online_portal',
    status: 'pending_review',
    notes: 'Pre-anesthetic evaluation for scheduled umbilical hernia repair',
    createdAt: '2026-10-24T20:30:00Z'
  },
  {
    id: 'APT-2026-004',
    uhid: 'SH-2026-00105',
    patientName: 'Meena Kumari',
    patientMobile: '9855667788',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    department: 'Gynecology & Obstetrics',
    date: '2026-10-25',
    slotTime: '11:30 AM',
    bookingType: 'routine',
    bookingSource: 'online_portal',
    status: 'confirmed',
    notes: 'Follow up USG Pelvis review',
    createdAt: '2026-10-24T21:10:00Z',
    confirmedAt: '2026-10-24T21:10:00Z'
  }
];

export const SEED_QUEUE_TOKENS: OpdQueueToken[] = [
  {
    id: 'TOK-001',
    tokenNumber: 1,
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    encounterId: 'ENC-2026-0091',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    status: 'in_consultation',
    checkInTime: '09:45 AM',
    calledTime: '10:02 AM',
    consultationStartTime: '10:05 AM'
  },
  {
    id: 'TOK-002',
    tokenNumber: 2,
    uhid: 'SH-2026-00103',
    patientName: 'Pooja Tiwari',
    encounterId: 'ENC-2026-0092',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    status: 'called',
    checkInTime: '10:10 AM',
    calledTime: '10:25 AM'
  },
  {
    id: 'TOK-003',
    tokenNumber: 3,
    uhid: 'SH-2026-00105',
    patientName: 'Meena Kumari',
    encounterId: 'ENC-2026-0093',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Vandana Jain',
    status: 'waiting',
    checkInTime: '10:20 AM'
  },
  {
    id: 'TOK-004',
    tokenNumber: 1,
    uhid: 'SH-2026-00102',
    patientName: 'Rajendra Singh',
    encounterId: 'ENC-2026-0094',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Ankit Jain',
    status: 'completed',
    checkInTime: '09:30 AM',
    calledTime: '09:40 AM',
    consultationStartTime: '09:42 AM',
    completedTime: '10:00 AM'
  }
];

export const SEED_EMERGENCY_CASES: EmergencyCase[] = [
  {
    id: 'EMG-2026-01',
    temporaryUhid: 'EMG-TMP-8801',
    patientName: 'Kunal Saxena',
    age: 29,
    gender: 'Male',
    arrivalTime: '2026-10-25T10:15:00Z',
    triage: 'red', // Red = Immediate
    attendingDoctor: 'Dr. Ankit Jain',
    chiefComplaint: 'Road traffic collision; blunt abdominal trauma, cold clammy extremities, BP 80/50',
    vitals: {
      bp: '80/50',
      pulse: 128,
      spO2: 92,
      temp: 97.6
    },
    treatmentGiven: 'Large bore 16G IV line established, 1000ml Ringer Lactate started wide open, O2 at 6L via mask, emergency cross match sent',
    disposition: 'observation',
    status: 'active'
  },
  {
    id: 'EMG-2026-02',
    temporaryUhid: 'EMG-TMP-8802',
    patientName: 'Saroj Devi',
    age: 62,
    gender: 'Female',
    arrivalTime: '2026-10-25T09:40:00Z',
    triage: 'yellow', // Urgent
    attendingDoctor: 'Dr. Devendra Swastik',
    chiefComplaint: 'Severe shortness of breath, bilateral pedal edema, history of CHF',
    vitals: {
      bp: '160/100',
      pulse: 104,
      spO2: 93,
      temp: 98.6
    },
    treatmentGiven: 'Inj. Furosemide 40mg IV stat, propped up position, high-flow nasal oxygen',
    disposition: 'admitted_ipd',
    reconciledWithPermanentUhid: 'SH-2026-00088',
    status: 'active'
  }
];

export const SEED_OT_BOOKINGS: OtBooking[] = [
  {
    id: 'OTB-2026-01',
    theatreName: 'Operation Theatre 1 (Main OT)',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    procedureName: 'Elective Lower Segment Caesarean Section (LSCS)',
    date: '2026-10-25',
    startTime: '13:00',
    endTime: '14:30',
    durationMinutes: 90,
    surgeonId: 'DOC-001',
    surgeonName: 'Dr. Vandana Jain',
    anesthesiologistId: 'DOC-002',
    anesthesiologistName: 'Dr. Ankit Jain',
    assistantStaff: ['Sister Sunita Patel', 'Ramesh Verma (OT Tech)'],
    requiresAnesthesia: true,
    preOpChecked: true,
    status: 'scheduled',
    notes: 'Spinal anesthesia planned. Blood 1 unit PRBC arranged on standby.'
  },
  {
    id: 'OTB-2026-02',
    theatreName: 'Operation Theatre 1 (Main OT)',
    uhid: 'SH-2026-00105',
    patientName: 'Meena Kumari',
    procedureName: 'Total Laparoscopic Hysterectomy (TLH)',
    date: '2026-10-25',
    startTime: '15:00',
    endTime: '17:00',
    durationMinutes: 120,
    surgeonId: 'DOC-001',
    surgeonName: 'Dr. Vandana Jain',
    anesthesiologistId: 'DOC-002',
    anesthesiologistName: 'Dr. Ankit Jain',
    assistantStaff: ['Ramesh Verma (OT Tech)', 'Sister Reena'],
    requiresAnesthesia: true,
    preOpChecked: false,
    status: 'planned',
    notes: 'Pre-op fitness clearance pending Dr. Ankit review.'
  }
];

export const SEED_RADIOLOGY_WORKLIST: RadiologyWorklistItem[] = [
  {
    id: 'RAD-2026-01',
    orderId: 'ORD-RAD-101',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    modality: 'USG',
    bodyPart: 'Obstetric / Pelvis (Color Doppler)',
    prescribingDoctor: 'Dr. Vandana Jain',
    scheduledDate: '2026-10-25 11:00 AM',
    status: 'authorized_released',
    findings: 'Single live intrauterine gestation corresponding to 36 weeks 2 days. Cephalic presentation. Adequate amniotic fluid (AFI 14 cm). Placenta posterior, high, not low lying. Umbilical artery S/D ratio 2.4 (normal).',
    impression: 'Healthy term viable fetus with normal biophysical profile and normal Doppler parameters.',
    reportedBy: 'Dr. M. K. Gupta',
    reportedAt: '2026-10-25T11:45:00Z',
    charge: 1800
  },
  {
    id: 'RAD-2026-02',
    orderId: 'ORD-RAD-102',
    uhid: 'SH-2026-00102',
    patientName: 'Rajendra Singh',
    modality: 'X-Ray',
    bodyPart: 'Right Foot (AP & Lateral View)',
    prescribingDoctor: 'Dr. Ankit Jain',
    scheduledDate: '2026-10-25 11:30 AM',
    status: 'in_progress',
    charge: 600
  },
  {
    id: 'RAD-2026-03',
    orderId: 'ORD-RAD-103',
    uhid: 'SH-2026-00104',
    patientName: 'Harish Chandra Gupta',
    modality: 'X-Ray',
    bodyPart: 'Chest PA View',
    prescribingDoctor: 'Dr. Devendra Swastik',
    scheduledDate: '2026-10-25 12:00 PM',
    status: 'scheduled',
    charge: 500
  }
];

export const SEED_LAB_TESTS: LabTestItem[] = [
  {
    id: 'LAB-2026-01',
    orderId: 'ORD-LAB-201',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    testCode: 'CBC-01',
    testName: 'Complete Blood Count (CBC) with Platelets',
    category: 'Hematology',
    processingLocation: 'in_house',
    specimenType: 'Whole Blood EDTA',
    specimenBarcodeId: 'SPEC-2026-9001',
    prescribingDoctor: 'Dr. Vandana Jain',
    orderedAt: '2026-10-25T08:45:00Z',
    status: 'authorized_released',
    parameterResults: [
      { parameter: 'Hemoglobin (Hb)', value: '11.8', unit: 'g/dL', normalRange: '12.0 - 15.5', isAbnormal: true },
      { parameter: 'Total Leukocyte Count (TLC)', value: '8,400', unit: '/cu mm', normalRange: '4,000 - 11,000', isAbnormal: false },
      { parameter: 'Platelet Count', value: '2.1', unit: 'Lakhs/cu mm', normalRange: '1.5 - 4.5', isAbnormal: false },
      { parameter: 'Hematocrit (PCV)', value: '35.2', unit: '%', normalRange: '36.0 - 46.0', isAbnormal: true }
    ],
    overallImpression: 'Mild microcytic hypochromic anemia consistent with pregnancy trimester 3.',
    authorizedSignatory: 'Rajesh Kumar (Lab Tech) & Dr. M. K. Gupta (Pathologist)',
    authorizedAt: '2026-10-25T10:15:00Z',
    fee: 350
  },
  {
    id: 'LAB-2026-02',
    orderId: 'ORD-LAB-202',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    testCode: 'BT-CT',
    testName: 'Bleeding Time & Clotting Time (BT/CT)',
    category: 'Coagulation',
    processingLocation: 'in_house',
    specimenType: 'Whole Blood',
    specimenBarcodeId: 'SPEC-2026-9002',
    prescribingDoctor: 'Dr. Vandana Jain',
    orderedAt: '2026-10-25T08:45:00Z',
    status: 'authorized_released',
    parameterResults: [
      { parameter: 'Bleeding Time (Duke)', value: '2 min 30 sec', unit: 'minutes', normalRange: '1 - 5 mins', isAbnormal: false },
      { parameter: 'Clotting Time (Lee-White)', value: '5 min 10 sec', unit: 'minutes', normalRange: '4 - 9 mins', isAbnormal: false }
    ],
    overallImpression: 'Coagulation profile within normal limits. Pre-operative clearance supported.',
    authorizedSignatory: 'Rajesh Kumar (Lab Tech)',
    authorizedAt: '2026-10-25T10:20:00Z',
    fee: 200
  },
  {
    id: 'LAB-2026-03',
    orderId: 'ORD-LAB-203',
    uhid: 'SH-2026-00102',
    patientName: 'Rajendra Singh',
    testCode: 'HBA1C-EXT',
    testName: 'HbA1c & Glycated Hemoglobin',
    category: 'Biochemistry',
    processingLocation: 'external_referral',
    externalLabPartner: 'Dr. Lal PathLabs Referral Network',
    specimenType: 'Fluoride Plasma & Whole Blood',
    specimenBarcodeId: 'SPEC-2026-9003',
    prescribingDoctor: 'Dr. Ankit Jain',
    orderedAt: '2026-10-25T09:00:00Z',
    status: 'processing',
    fee: 650
  }
];

export const SEED_INVENTORY: InventoryItem[] = [
  {
    id: 'MED-001',
    name: 'Augmentin 625mg Tab',
    genericName: 'Amoxicillin + Clavulanic Acid 625mg',
    category: 'tablet',
    unit: 'Strip of 10',
    totalStock: 85,
    reorderLevel: 30,
    batches: [
      {
        batchNumber: 'AUG-24B12',
        expiryDate: '2027-04-30',
        currentStock: 60,
        mrp: 220,
        purchaseRate: 155,
        supplier: 'MedPlus Pharma Distributors'
      },
      {
        batchNumber: 'AUG-23X09',
        expiryDate: '2026-11-30', // Expiring soon alert!
        currentStock: 25,
        mrp: 210,
        purchaseRate: 150,
        supplier: 'Sun Healthcare Logistics'
      }
    ]
  },
  {
    id: 'MED-002',
    name: 'Paracetamol 650mg Tab (Dolo 650)',
    genericName: 'Paracetamol 650mg',
    category: 'tablet',
    unit: 'Strip of 15',
    totalStock: 140,
    reorderLevel: 50,
    batches: [
      {
        batchNumber: 'DOL-99A',
        expiryDate: '2027-09-30',
        currentStock: 140,
        mrp: 35,
        purchaseRate: 22,
        supplier: 'Micro Labs Direct'
      }
    ]
  },
  {
    id: 'MED-003',
    name: 'Inj. Cefuroxime 1.5g',
    genericName: 'Cefuroxime Sodium 1.5g',
    category: 'injection',
    unit: 'Vial',
    totalStock: 18, // Low stock alert!
    reorderLevel: 25,
    batches: [
      {
        batchNumber: 'CEF-774A',
        expiryDate: '2027-02-28',
        currentStock: 18,
        mrp: 145,
        purchaseRate: 98,
        supplier: 'Alkem Laboratories'
      }
    ]
  },
  {
    id: 'MED-004',
    name: 'Inj. Bupivacaine Heavy 0.5% 4ml',
    genericName: 'Bupivacaine Hydrochloride for Spinal Anesthesia',
    category: 'injection',
    unit: 'Ampoule',
    totalStock: 45,
    reorderLevel: 20,
    batches: [
      {
        batchNumber: 'BUP-551C',
        expiryDate: '2027-08-31',
        currentStock: 45,
        mrp: 68,
        purchaseRate: 42,
        supplier: 'Neon Laboratories'
      }
    ]
  },
  {
    id: 'MED-005',
    name: 'IV Cannula 20G Pink',
    genericName: 'Sterile I.V. Cannula with Port',
    category: 'consumable',
    unit: 'Piece',
    totalStock: 9, // Critical low stock alert!
    reorderLevel: 50,
    batches: [
      {
        batchNumber: 'CAN-20G-01',
        expiryDate: '2028-05-31',
        currentStock: 9,
        mrp: 45,
        purchaseRate: 24,
        supplier: 'Romsons Meditech'
      }
    ]
  }
];

export const SEED_SERVICE_CATALOG: ServiceCatalogItem[] = [
  { id: 'SRV-001', code: 'OPD-GYN', name: 'Gynecology OPD Consultation (Dr. Vandana Jain)', department: 'opd', price: 600, isActive: true, taxPercent: 0 },
  { id: 'SRV-002', code: 'OPD-ANE', name: 'Anesthesia Pre-Op Evaluation (Dr. Ankit Jain)', department: 'opd', price: 800, isActive: true, taxPercent: 0 },
  { id: 'SRV-003', code: 'BED-GM', name: 'General Ward Bed Charge per Day', department: 'ipd', price: 1200, isActive: true, taxPercent: 0 },
  { id: 'SRV-004', code: 'BED-SP', name: 'Semi-Private Room Bed Charge per Day', department: 'ipd', price: 2500, isActive: true, taxPercent: 0 },
  { id: 'SRV-005', code: 'BED-DP', name: 'Deluxe Private Suite Bed Charge per Day', department: 'ipd', price: 5000, isActive: true, taxPercent: 0 },
  { id: 'SRV-006', code: 'BED-ICU', name: 'Intensive Care Unit (ICU) Bed Charge per Day', department: 'ipd', price: 7500, isActive: true, taxPercent: 0 },
  { id: 'SRV-007', code: 'OT-LSCS', name: 'Lower Segment Caesarean Section OT Procedure Charge', department: 'ot', price: 25000, isActive: true, taxPercent: 0 },
  { id: 'SRV-008', code: 'OT-GEN', name: 'General Major Operation Theatre Booking (1 hr)', department: 'ot', price: 8000, isActive: true, taxPercent: 0 },
  { id: 'SRV-009', code: 'RAD-USG', name: 'Ultrasound Pelvis / Obstetric Scanning', department: 'radiology', price: 1800, isActive: true, taxPercent: 0 },
  { id: 'SRV-010', code: 'RAD-XRAY', name: 'Digital X-Ray Single View', department: 'radiology', price: 500, isActive: true, taxPercent: 0 },
  { id: 'SRV-011', code: 'LAB-CBC', name: 'Complete Blood Count (CBC) with ESR', department: 'laboratory', price: 350, isActive: true, taxPercent: 0 },
  { id: 'SRV-012', code: 'LAB-KFT', name: 'Kidney Function Test (KFT / RFT)', department: 'laboratory', price: 850, isActive: true, taxPercent: 0 }
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-00401',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    encounterId: 'ENC-2026-0091',
    admissionId: 'ADM-2026-00043',
    date: '2026-10-25',
    lines: [
      { id: 'L-01', serviceId: 'SRV-004', description: 'Semi-Private Room Bed Charge (1 Day)', category: 'ipd', unitPrice: 2500, quantity: 1, total: 2500 },
      { id: 'L-02', serviceId: 'SRV-009', description: 'Ultrasound Pelvis / Obstetric Scanning', category: 'radiology', unitPrice: 1800, quantity: 1, total: 1800 },
      { id: 'L-03', serviceId: 'SRV-011', description: 'Complete Blood Count (CBC)', category: 'laboratory', unitPrice: 350, quantity: 1, total: 350 },
      { id: 'L-04', serviceId: 'MED-001', description: 'Augmentin 625mg (Batch AUG-24B12)', category: 'pharmacy', unitPrice: 220, quantity: 1, total: 220 }
    ],
    subtotal: 4870,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 4870,
    amountPaid: 3000,
    balanceDue: 1870,
    status: 'partially_paid',
    payments: [
      {
        paymentId: 'PAY-001',
        amount: 3000,
        method: 'upi',
        transactionRef: 'UPI/20261024/9918237192',
        date: '2026-10-24 09:15',
        receivedBy: 'Neha Mehra (Billing)'
      }
    ],
    refunds: []
  },
  {
    id: 'INV-2026-00402',
    uhid: 'SH-2026-00102',
    patientName: 'Rajendra Singh',
    encounterId: 'ENC-2026-0094',
    date: '2026-10-25',
    lines: [
      { id: 'L-05', serviceId: 'SRV-002', description: 'Anesthesia Pre-Op Evaluation (Dr. Ankit Jain)', category: 'opd', unitPrice: 800, quantity: 1, total: 800 }
    ],
    subtotal: 800,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 800,
    amountPaid: 800,
    balanceDue: 0,
    status: 'paid',
    payments: [
      {
        paymentId: 'PAY-002',
        amount: 800,
        method: 'cash',
        transactionRef: 'CASH-REC-1029',
        date: '2026-10-25 10:05',
        receivedBy: 'Neha Mehra (Billing)'
      }
    ],
    refunds: []
  }
];

export const SEED_EXPENSES: HospitalExpense[] = [
  {
    id: 'EXP-2026-01',
    date: '2026-10-23',
    category: 'medical_supplies',
    supplierOrVendor: 'Romsons Meditech Pvt Ltd',
    invoiceNumber: 'ROM-INV-9921',
    amount: 14500,
    paymentMode: 'bank_transfer',
    status: 'paid',
    approvedBy: 'Suresh Singhal (Finance)',
    description: 'Procurement of IV Cannulas, Syringes, Blood Collection Tubes, Surgical Drapes'
  },
  {
    id: 'EXP-2026-02',
    date: '2026-10-24',
    category: 'utilities',
    supplierOrVendor: 'BSES Rajdhani Power Limited',
    invoiceNumber: 'BSES-OCT-2026-09',
    amount: 38200,
    paymentMode: 'bank_transfer',
    status: 'approved',
    approvedBy: 'Dr. Devendra Swastik',
    description: 'Hospital electricity bill for October 2026 billing cycle'
  },
  {
    id: 'EXP-2026-03',
    date: '2026-10-25',
    category: 'equipment_maintenance',
    supplierOrVendor: 'GE Healthcare Bio-Sciences (India)',
    invoiceNumber: 'GE-AMC-2026-44',
    amount: 22000,
    paymentMode: 'bank_transfer',
    status: 'pending_approval',
    description: 'Quarterly AMC inspection and probe calibration for Ultrasound & Color Doppler unit'
  }
];

export const SEED_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-2026-01',
    ticketNumber: 'SW-TCK-1001',
    uhid: 'SH-2026-00101',
    patientName: 'Sunita Aggarwal',
    category: 'facility',
    priority: 'medium',
    assignedToDepartment: 'Maintenance',
    subject: 'Air Conditioning cooling weak in Semi-Private Room 101',
    description: 'Patient attendant reports AC is not cooling sufficiently during afternoon hours.',
    status: 'in_progress',
    resolutionNotes: 'Technician dispatched to clean filter and top up refrigerant gas.',
    createdAt: '2026-10-25T09:30:00Z',
    updatedAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'TCK-2026-02',
    ticketNumber: 'SW-TCK-1002',
    category: 'it_software',
    priority: 'low',
    assignedToDepartment: 'IT Helpdesk',
    subject: 'Thermal barcode printer paper roll replacement at Reception Counter 1',
    description: 'Counter 1 barcode printer running low on 50mm label roll.',
    status: 'resolved',
    resolutionNotes: 'Replaced with new 500-label roll. Tested sample print test successfully.',
    createdAt: '2026-10-25T08:15:00Z',
    updatedAt: '2026-10-25T08:45:00Z'
  }
];

export const SEED_DOWNTIME_RECORDS: DowntimeManualRecord[] = [
  {
    id: 'DT-REC-01',
    tempReferenceId: 'OFFLINE-MAN-091',
    patientName: 'Devi Prasad',
    phone: '9871122334',
    entryType: 'opd_walkin',
    attendingStaff: 'Priya Sharma (Counter 1)',
    serviceRendered: 'Emergency dressing and wound debridement',
    amountCollected: 500,
    paymentMode: 'Cash',
    recordedTimestamp: '2026-10-24 16:30',
    reconciled: false,
    reconciliationNotes: 'Awaiting permanent UHID generation and cashier receipt verification'
  }
];
