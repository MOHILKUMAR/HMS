import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding Swastik Hospital PostgreSQL Database...');

  const defaultPasswordHash = await bcrypt.hash('Swastik@2026', 10);

  // 1. Staff Users
  const users = [
    { id: 'USR-001', name: 'Dr. Devendra Swastik', email: 'admin@swastikhospital.in', mobile: '9876543210', role: 'admin', department: 'Hospital Administration', mfaEnabled: true, passwordHash: defaultPasswordHash },
    { id: 'DOC-001', name: 'Dr. Vandana Jain', email: 'vandana.jain@swastikhospital.in', mobile: '9876501001', role: 'doctor_gynecologist', department: 'Gynecology & Obstetrics', mfaEnabled: true, passwordHash: defaultPasswordHash },
    { id: 'DOC-002', name: 'Dr. Ankit Jain', email: 'ankit.jain@swastikhospital.in', mobile: '9876501002', role: 'doctor_anesthesiologist', department: 'Anesthesiology & Critical Care', mfaEnabled: true, passwordHash: defaultPasswordHash },
    { id: 'USR-003', name: 'Priya Sharma', email: 'reception@swastikhospital.in', mobile: '9876501003', role: 'reception', department: 'Front Desk & Appointments', passwordHash: defaultPasswordHash },
    { id: 'USR-004', name: 'Sister Sunita Patel', email: 'nursing@swastikhospital.in', mobile: '9876501004', role: 'nurse', department: 'Inpatient Nursing', passwordHash: defaultPasswordHash },
    { id: 'USR-005', name: 'Ramesh Verma', email: 'ot@swastikhospital.in', mobile: '9876501005', role: 'ot_coordinator', department: 'Operation Theatre', passwordHash: defaultPasswordHash },
    { id: 'USR-006', name: 'Dr. M. K. Gupta', email: 'radiology@swastikhospital.in', mobile: '9876501006', role: 'radiologist', department: 'Radiology & Imaging', mfaEnabled: true, passwordHash: defaultPasswordHash },
    { id: 'USR-007', name: 'Rajesh Kumar', email: 'lab@swastikhospital.in', mobile: '9876501007', role: 'lab_technician', department: 'Pathology & Lab', passwordHash: defaultPasswordHash },
    { id: 'USR-008', name: 'Amit Shah', email: 'pharmacy@swastikhospital.in', mobile: '9876501008', role: 'pharmacist', department: 'Hospital Pharmacy', passwordHash: defaultPasswordHash },
    { id: 'USR-009', name: 'Neha Mehra', email: 'billing@swastikhospital.in', mobile: '9876501009', role: 'billing_cashier', department: 'Central Billing', passwordHash: defaultPasswordHash },
    { id: 'USR-010', name: 'Suresh Singhal', email: 'finance@swastikhospital.in', mobile: '9876501010', role: 'finance_manager', department: 'Finance & Accounts', mfaEnabled: true, passwordHash: defaultPasswordHash },
    { id: 'USR-011', name: 'Anita Rao', email: 'support@swastikhospital.in', mobile: '9876501011', role: 'support_manager', department: 'Patient Grievance & Helpdesk', passwordHash: defaultPasswordHash }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u
    });
  }

  // 2. 35 Inpatient Beds
  const bedDefinitions = [
    // General Male (10 beds)
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `BED-GM-${(i + 1).toString().padStart(2, '0')}`,
      bedNumber: `GM-${(i + 1).toString().padStart(2, '0')}`,
      wardId: 'W-GM',
      wardName: 'General Ward (Male)',
      wardType: 'general_male',
      chargePerDay: 1200,
      status: i === 0 ? 'occupied' : (i === 3 ? 'cleaning_blocked' : 'available'),
      currentAdmissionId: i === 0 ? 'ADM-2026-00041' : null,
      currentPatientName: i === 0 ? 'Rajendra Singh' : null,
      currentUhid: i === 0 ? 'SH-2026-00102' : null
    })),
    // General Female (10 beds)
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `BED-GF-${(i + 1).toString().padStart(2, '0')}`,
      bedNumber: `GF-${(i + 1).toString().padStart(2, '0')}`,
      wardId: 'W-GF',
      wardName: 'General Ward (Female)',
      wardType: 'general_female',
      chargePerDay: 1200,
      status: i === 0 ? 'occupied' : 'available',
      currentAdmissionId: i === 0 ? 'ADM-2026-00042' : null,
      currentPatientName: i === 0 ? 'Pooja Tiwari' : null,
      currentUhid: i === 0 ? 'SH-2026-00103' : null
    })),
    // Semi-Private (8 beds)
    ...Array.from({ length: 8 }).map((_, i) => {
      const room = Math.floor(i / 2) + 101;
      const sub = i % 2 === 0 ? 'A' : 'B';
      return {
        id: `BED-SP-${(i + 1).toString().padStart(2, '0')}`,
        bedNumber: `SP-${room}${sub}`,
        wardId: 'W-SP',
        wardName: `Semi-Private Room ${room}`,
        wardType: 'semi_private',
        chargePerDay: 2500,
        status: i === 0 ? 'occupied' : 'available',
        currentAdmissionId: i === 0 ? 'ADM-2026-00043' : null,
        currentPatientName: i === 0 ? 'Sunita Aggarwal' : null,
        currentUhid: i === 0 ? 'SH-2026-00101' : null
      };
    }),
    // Deluxe Private (4 beds)
    ...Array.from({ length: 4 }).map((_, i) => ({
      id: `BED-DP-${(i + 1).toString().padStart(2, '0')}`,
      bedNumber: `DP-20${i + 1}`,
      wardId: 'W-DP',
      wardName: `Deluxe Suite 20${i + 1}`,
      wardType: 'deluxe_private',
      chargePerDay: 5000,
      status: 'available'
    })),
    // ICU (3 beds)
    ...Array.from({ length: 3 }).map((_, i) => ({
      id: `BED-ICU-${(i + 1).toString().padStart(2, '0')}`,
      bedNumber: `ICU-0${i + 1}`,
      wardId: 'W-ICU',
      wardName: 'Intensive Care Unit (ICU)',
      wardType: 'icu',
      chargePerDay: 7500,
      status: i === 0 ? 'occupied' : 'available',
      currentAdmissionId: i === 0 ? 'ADM-2026-00044' : null,
      currentPatientName: i === 0 ? 'Harish Chandra Gupta' : null,
      currentUhid: i === 0 ? 'SH-2026-00104' : null
    }))
  ];

  for (const b of bedDefinitions) {
    await prisma.bed.upsert({
      where: { bedNumber: b.bedNumber },
      update: b,
      create: b
    });
  }

  // 3. Service Catalog
  const catalog = [
    { id: 'SRV-001', code: 'OPD-GYN', name: 'Gynecology OPD Consultation (Dr. Vandana Jain)', department: 'opd', price: 600, isActive: true },
    { id: 'SRV-002', code: 'OPD-ANE', name: 'Anesthesia Pre-Op Evaluation (Dr. Ankit Jain)', department: 'opd', price: 800, isActive: true },
    { id: 'SRV-003', code: 'BED-GM', name: 'General Ward Bed Charge per Day', department: 'ipd', price: 1200, isActive: true },
    { id: 'SRV-004', code: 'BED-SP', name: 'Semi-Private Room Bed Charge per Day', department: 'ipd', price: 2500, isActive: true },
    { id: 'SRV-005', code: 'BED-DP', name: 'Deluxe Private Suite Bed Charge per Day', department: 'ipd', price: 5000, isActive: true },
    { id: 'SRV-006', code: 'BED-ICU', name: 'Intensive Care Unit (ICU) Bed Charge per Day', department: 'ipd', price: 7500, isActive: true },
    { id: 'SRV-007', code: 'OT-LSCS', name: 'Lower Segment Caesarean Section OT Procedure Charge', department: 'ot', price: 25000, isActive: true },
    { id: 'SRV-008', code: 'OT-GEN', name: 'General Major Operation Theatre Booking (1 hr)', department: 'ot', price: 8000, isActive: true },
    { id: 'SRV-009', code: 'RAD-USG', name: 'Ultrasound Pelvis / Obstetric Scanning', department: 'radiology', price: 1800, isActive: true },
    { id: 'SRV-010', code: 'RAD-XRAY', name: 'Digital X-Ray Single View', department: 'radiology', price: 500, isActive: true },
    { id: 'SRV-011', code: 'LAB-CBC', name: 'Complete Blood Count (CBC) with ESR', department: 'laboratory', price: 350, isActive: true },
    { id: 'SRV-012', code: 'LAB-KFT', name: 'Kidney Function Test (KFT / RFT)', department: 'laboratory', price: 850, isActive: true }
  ];

  for (const item of catalog) {
    await prisma.serviceCatalogItem.upsert({
      where: { code: item.code },
      update: item,
      create: item
    });
  }

  console.log('✅ Swastik Hospital PostgreSQL Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
