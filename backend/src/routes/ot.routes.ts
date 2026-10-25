import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Check Overlap Conflict Helper
const checkConflict = async (date: string, startTime: string, endTime: string, surgeonId: string, anesthesiologistId?: string, excludeId?: string) => {
  const isOverlapping = (s1: string, e1: string, s2: string, e2: string) => (s1 < e2 && e1 > s2);

  const bookings = await prisma.otBooking.findMany({
    where: {
      date,
      status: { not: 'cancelled' },
      id: excludeId ? { not: excludeId } : undefined
    }
  });

  for (const b of bookings) {
    if (isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
      // OT 1 Room conflict
      return {
        hasConflict: true,
        reason: `Operation Theatre 1 is already reserved for "${b.procedureName}" between ${b.startTime} - ${b.endTime}`
      };
    }

    if (b.surgeonId === surgeonId && isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
      return {
        hasConflict: true,
        reason: `Surgeon ${b.surgeonName} is already committed to another case during that window.`
      };
    }

    if (anesthesiologistId && b.anesthesiologistId === anesthesiologistId && isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
      return {
        hasConflict: true,
        reason: `Anesthesiologist Dr. Ankit Jain is already committed to another case during that window.`
      };
    }
  }

  return { hasConflict: false };
};

// List Bookings
router.get('/bookings', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.otBooking.findMany({
      orderBy: { startTime: 'asc' }
    });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Conflict Checker Endpoint
router.post('/check-conflicts', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { date, startTime, endTime, surgeonId, anesthesiologistId, excludeId } = req.body;
  try {
    const conflictResult = await checkConflict(date, startTime, endTime, surgeonId, anesthesiologistId, excludeId);
    res.json(conflictResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Book OT Case
router.post('/book', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { 
    theatreName, uhid, patientName, procedureName, date, 
    startTime, endTime, durationMinutes, surgeonId, surgeonName, 
    anesthesiologistId, anesthesiologistName, assistantStaff, 
    requiresAnesthesia, notes 
  } = req.body;

  try {
    const conflict = await checkConflict(date, startTime, endTime, surgeonId, requiresAnesthesia ? anesthesiologistId : undefined);
    if (conflict.hasConflict) {
      return res.status(409).json({ error: conflict.reason });
    }

    const count = await prisma.otBooking.count();
    const id = `OTB-2026-${(count + 1).toString().padStart(2, '0')}`;

    const newBooking = await prisma.otBooking.create({
      data: {
        id,
        theatreName: theatreName || 'Operation Theatre 1 (Main OT)',
        uhid,
        patientName,
        procedureName,
        date,
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes) || 90,
        surgeonId,
        surgeonName,
        anesthesiologistId: requiresAnesthesia ? anesthesiologistId : null,
        anesthesiologistName: requiresAnesthesia ? anesthesiologistName : null,
        assistantStaff: assistantStaff || ['Sister Sunita Patel', 'Ramesh Verma (OT Tech)'],
        requiresAnesthesia: Boolean(requiresAnesthesia),
        preOpChecked: true,
        status: 'scheduled',
        notes
      }
    });

    await recordAuditLog(
      surgeonName,
      'OT_BOOKING',
      'Operation Theatre',
      id,
      `Booked OT 1 for ${procedureName} on ${date} at ${startTime}`
    );

    res.status(201).json(newBooking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Case Status
router.patch('/:id/status', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    const updated = await prisma.otBooking.update({
      where: { id: req.params.id },
      data: { status }
    });

    await recordAuditLog(
      req.user?.name || 'OT Staff',
      'OT_STATUS_CHANGE',
      'Operation Theatre',
      req.params.id,
      `Case status changed to ${status}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
