import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Search / List Patients
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  try {
    const patients = await prisma.patient.findMany({
      where: query ? {
        OR: [
          { uhid: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { mobile: { contains: query } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate Detection Check
router.post('/check-duplicates', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { phone, name } = req.body;
  try {
    const duplicates = await prisma.patient.findMany({
      where: {
        OR: [
          phone ? { mobile: { contains: phone } } : {},
          name ? { name: { contains: name, mode: 'insensitive' } } : {}
        ]
      }
    });
    res.json(duplicates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Patient by UHID
router.get('/:uhid', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { uhid: req.params.uhid }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register New Patient (Permanent UHID)
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { name, age, gender, mobile, dob, address, bloodGroup, allergies, history, emergencyContact } = req.body;
  
  try {
    const count = await prisma.patient.count();
    const seq = 101 + count;
    const uhid = `SH-2026-${seq.toString().padStart(5, '0')}`;

    const newPatient = await prisma.patient.create({
      data: {
        uhid,
        name,
        age: Number(age),
        gender,
        mobile,
        dob,
        address,
        bloodGroup,
        allergies: allergies || [],
        history: history || [],
        emergencyContact: emergencyContact || { name: 'Emergency Contact', relation: 'Family', phone: mobile }
      }
    });

    await recordAuditLog(
      req.user?.name || 'Staff',
      'PATIENT_REGISTER',
      'Registration',
      uhid,
      `Permanent UHID generated for ${name} (${uhid})`
    );

    res.status(201).json(newPatient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
