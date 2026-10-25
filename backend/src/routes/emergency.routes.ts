import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// List Emergency Cases
router.get('/cases', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cases = await prisma.emergencyCase.findMany({
      orderBy: { arrivalTime: 'desc' }
    });
    res.json(cases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Rapid Emergency Arrival Intake
router.post('/arrival', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { patientName, age, gender, triage, attendingDoctor, chiefComplaint, vitals, treatmentGiven, disposition } = req.body;

  try {
    const tempId = `EMG-TMP-${Math.floor(Math.random() * 9000) + 1000}`;

    const newCase = await prisma.emergencyCase.create({
      data: {
        temporaryUhid: tempId,
        patientName,
        age: Number(age) || 30,
        gender: gender || 'Unknown',
        triage: triage || 'red',
        attendingDoctor: attendingDoctor || 'Dr. Ankit Jain',
        chiefComplaint,
        vitals: vitals || { bp: '80/50', pulse: 120, spO2: 92, temp: 98.0 },
        treatmentGiven,
        disposition: disposition || 'observation',
        status: 'active'
      }
    });

    await recordAuditLog(
      req.user?.name || 'Emergency Triage',
      'EMERGENCY_ARRIVAL',
      'Emergency Triage',
      tempId,
      `Triage ${triage.toUpperCase()} for ${patientName}`
    );

    res.status(201).json(newCase);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reconcile with Permanent UHID
router.post('/reconcile', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { caseId, permanentUhid } = req.body;

  try {
    const updated = await prisma.emergencyCase.update({
      where: { id: caseId },
      data: { reconciledWithPermanentUhid: permanentUhid }
    });

    await recordAuditLog(
      req.user?.name || 'Staff',
      'EMERGENCY_RECONCILE',
      'Emergency',
      updated.temporaryUhid,
      `Reconciled with permanent UHID ${permanentUhid}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
