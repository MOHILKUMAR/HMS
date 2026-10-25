import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Get Queue Tokens
router.get('/queue', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { doctorId } = req.query;
  try {
    const tokens = await prisma.opdQueueToken.findMany({
      where: doctorId && doctorId !== 'all' ? { doctorId: String(doctorId) } : undefined,
      orderBy: { tokenNumber: 'asc' }
    });
    res.json(tokens);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Issue Queue Token
router.post('/queue/issue', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { uhid, patientName, doctorId, doctorName, isEmergency } = req.body;

  try {
    const doctorTokensCount = await prisma.opdQueueToken.count({
      where: { doctorId }
    });

    const tokenNumber = doctorTokensCount + 1;
    const encounterId = `ENC-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const token = await prisma.opdQueueToken.create({
      data: {
        id: `TOK-${Date.now()}`,
        tokenNumber,
        uhid,
        patientName,
        encounterId,
        doctorId,
        doctorName,
        status: 'waiting',
        checkInTime,
        isEmergencyPriority: Boolean(isEmergency)
      }
    });

    await recordAuditLog(
      req.user?.name || 'Reception',
      'QUEUE_TOKEN_ISSUED',
      'OPD Queue',
      encounterId,
      `Token #${tokenNumber} issued to ${patientName} for ${doctorName}`
    );

    res.status(201).json(token);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Queue Token Status
router.patch('/queue/:id/status', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const dataToUpdate: any = { status };
    if (status === 'called') dataToUpdate.calledTime = timeNow;
    if (status === 'in_consultation') dataToUpdate.consultationStartTime = timeNow;
    if (status === 'completed') dataToUpdate.completedTime = timeNow;

    const updated = await prisma.opdQueueToken.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });

    await recordAuditLog(
      req.user?.name || 'Doctor',
      'QUEUE_STATUS_UPDATE',
      'OPD Queue',
      req.params.id,
      `Queue token state changed to ${status}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save Digital Consultation Notes (Specialty Templates Included)
router.post('/consultation', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { 
    encounterId, uhid, doctorId, doctorName, chiefComplaints, 
    historyOfPresentIllness, vitals, allergiesNoted, diagnosis, 
    clinicalNotes, prescriptions, investigations, followUpDate, 
    gynecologyData, anesthesiaData 
  } = req.body;

  try {
    const consultation = await prisma.clinicalConsultation.upsert({
      where: { encounterId },
      update: {
        chiefComplaints,
        historyOfPresentIllness,
        vitals,
        allergiesNoted: allergiesNoted || [],
        diagnosis,
        clinicalNotes,
        prescriptions: prescriptions || [],
        investigations: investigations || [],
        followUpDate,
        gynecologyData,
        anesthesiaData,
        finalized: true,
        finalizedAt: new Date()
      },
      create: {
        id: `CON-${Date.now()}`,
        encounterId,
        uhid,
        doctorId,
        doctorName,
        chiefComplaints,
        historyOfPresentIllness,
        vitals,
        allergiesNoted: allergiesNoted || [],
        diagnosis,
        clinicalNotes,
        prescriptions: prescriptions || [],
        investigations: investigations || [],
        followUpDate,
        gynecologyData,
        anesthesiaData,
        finalized: true,
        finalizedAt: new Date()
      }
    });

    // Mark token as completed
    await prisma.opdQueueToken.updateMany({
      where: { encounterId },
      data: { status: 'completed', completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    });

    await recordAuditLog(
      doctorName,
      'CONSULTATION_FINALIZED',
      'Clinical OPD',
      encounterId,
      `Digital prescription and notes finalized for UHID ${uhid}`
    );

    res.status(201).json(consultation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
