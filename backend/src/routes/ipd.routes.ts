import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Beds Matrix
router.get('/beds', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const beds = await prisma.bed.findMany({
      orderBy: { bedNumber: 'asc' }
    });
    res.json(beds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Direct IPD Admission with ACID Transaction
router.post('/admit', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { uhid, patientName, gender, age, bedId, attendingDoctorId, attendingDoctorName, admissionReason, attendantDetails } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify and lock bed
      const targetBed = await tx.bed.findUnique({
        where: { id: bedId }
      });

      if (!targetBed || targetBed.status !== 'available') {
        throw new Error(`Bed ${targetBed?.bedNumber || bedId} is not available for admission.`);
      }

      const count = await tx.admission.count();
      const admissionId = `ADM-2026-${(count + 45).toString().padStart(5, '0')}`;

      // 2. Create Admission Record
      const admission = await tx.admission.create({
        data: {
          admissionId,
          uhid,
          patientName,
          gender,
          age: Number(age),
          bedId: targetBed.id,
          bedNumber: targetBed.bedNumber,
          wardName: targetBed.wardName,
          attendingDoctorId,
          attendingDoctorName,
          admissionReason,
          attendantDetails: attendantDetails || { name: 'Attendant', phone: '9876543210', relation: 'Family' },
          status: 'active',
          bedHistory: [
            {
              bedId: targetBed.id,
              bedNumber: targetBed.bedNumber,
              wardName: targetBed.wardName,
              from: new Date().toISOString()
            }
          ]
        }
      });

      // 3. Update Bed Status to Occupied
      await tx.bed.update({
        where: { id: targetBed.id },
        data: {
          status: 'occupied',
          currentAdmissionId: admissionId,
          currentPatientName: patientName,
          currentUhid: uhid
        }
      });

      return admission;
    });

    await recordAuditLog(
      attendingDoctorName,
      'IPD_ADMISSION',
      'IPD Ward',
      result.admissionId,
      `Admitted ${patientName} (${uhid}) to Bed ${result.bedNumber}`
    );

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Transfer Bed with ACID Transaction
router.post('/transfer', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { admissionId, targetBedId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { admissionId }
      });

      if (!admission || admission.status !== 'active') {
        throw new Error('Active admission not found');
      }

      const targetBed = await tx.bed.findUnique({
        where: { id: targetBedId }
      });

      if (!targetBed || targetBed.status !== 'available') {
        throw new Error('Target bed is not vacant/available');
      }

      const oldBedId = admission.bedId;

      // Old bed released to cleaning
      await tx.bed.update({
        where: { id: oldBedId },
        data: {
          status: 'cleaning_blocked',
          currentAdmissionId: null,
          currentPatientName: null,
          currentUhid: null
        }
      });

      // Target bed occupied
      await tx.bed.update({
        where: { id: targetBed.id },
        data: {
          status: 'occupied',
          currentAdmissionId: admission.admissionId,
          currentPatientName: admission.patientName,
          currentUhid: admission.uhid
        }
      });

      const updatedHistory = Array.isArray(admission.bedHistory) ? [...(admission.bedHistory as any[])] : [];
      updatedHistory.push({
        bedId: targetBed.id,
        bedNumber: targetBed.bedNumber,
        wardName: targetBed.wardName,
        from: new Date().toISOString()
      });

      return await tx.admission.update({
        where: { admissionId },
        data: {
          bedId: targetBed.id,
          bedNumber: targetBed.bedNumber,
          wardName: targetBed.wardName,
          bedHistory: updatedHistory
        }
      });
    });

    await recordAuditLog(
      req.user?.name || 'Staff',
      'BED_TRANSFER',
      'IPD Ward',
      admissionId,
      `Transferred patient to Bed ${result.bedNumber}`
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Record Inpatient Vitals
router.post('/vitals', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { admissionId, uhid, bpSystolic, bpDiastolic, pulse, temperature, spO2, respiratoryRate, nursingNotes } = req.body;

  try {
    const record = await prisma.inpatientVitalRecord.create({
      data: {
        admissionId,
        uhid,
        recordedBy: req.user?.name || 'Nurse Sunita Patel',
        bpSystolic: Number(bpSystolic),
        bpDiastolic: Number(bpDiastolic),
        pulse: Number(pulse),
        temperature: Number(temperature),
        spO2: Number(spO2),
        respiratoryRate: Number(respiratoryRate),
        nursingNotes
      }
    });

    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authorize Clinical Discharge (Distinct from Billing)
router.post('/authorize-discharge', verifyAuth, requireRole(['doctor_gynecologist', 'doctor_anesthesiologist', 'admin']), async (req: AuthRequest, res: Response) => {
  const { admissionId, dischargeNotes } = req.body;

  try {
    const updated = await prisma.admission.update({
      where: { admissionId },
      data: {
        clinicalDischargeAuthorized: true,
        clinicalDischargeDoctor: req.user?.name || 'Consultant Doctor',
        clinicalDischargeNotes: dischargeNotes
      }
    });

    await recordAuditLog(
      req.user?.name || 'Doctor',
      'CLINICAL_DISCHARGE_AUTH',
      'IPD Ward',
      admissionId,
      `Clinical discharge authorized by ${req.user?.name}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Finalize Discharge and Release Bed
router.post('/finalize-discharge', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { admissionId } = req.body;

  try {
    const admission = await prisma.admission.findUnique({ where: { admissionId } });
    if (!admission || !admission.clinicalDischargeAuthorized) {
      return res.status(400).json({ error: 'Clinical discharge must be authorized by attending doctor first.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Release bed to cleaning
      await tx.bed.update({
        where: { id: admission.bedId },
        data: {
          status: 'cleaning_blocked',
          currentAdmissionId: null,
          currentPatientName: null,
          currentUhid: null
        }
      });

      // 2. Mark admission discharged
      return await tx.admission.update({
        where: { admissionId },
        data: {
          status: 'discharged',
          dischargeDate: new Date(),
          financialSettled: true
        }
      });
    });

    await recordAuditLog(
      req.user?.name || 'Billing/Discharge',
      'PATIENT_DISCHARGED',
      'IPD Ward',
      admissionId,
      `Patient discharged. Bed ${admission.bedNumber} marked for cleaning.`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
