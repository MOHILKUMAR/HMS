import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// List Appointments
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { doctorId, date, status, uhid } = req.query;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId ? String(doctorId) : undefined,
        date: date ? String(date) : undefined,
        status: status ? String(status) : undefined,
        uhid: uhid ? String(uhid) : undefined
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Book Slot (With Double-Booking Prevention & Hybrid Routing)
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { uhid, patientName, patientMobile, doctorId, doctorName, department, date, slotTime, bookingType, notes } = req.body;

  try {
    // 1. Double booking conflict check
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        slotTime,
        status: { notIn: ['cancelled', 'no_show'] }
      }
    });

    if (existing) {
      return res.status(409).json({ 
        error: `Slot ${slotTime} on ${date} for ${doctorName} is already booked!` 
      });
    }

    const count = await prisma.appointment.count();
    const id = `APT-2026-${(count + 1).toString().padStart(3, '0')}`;

    // Hybrid routing: Routine is instantly confirmed; Special/Referral enters pending review
    const status = bookingType === 'special_referral' ? 'pending_review' : 'confirmed';

    const newAppointment = await prisma.appointment.create({
      data: {
        id,
        uhid,
        patientName,
        patientMobile,
        doctorId,
        doctorName,
        department,
        date,
        slotTime,
        bookingType: bookingType || 'routine',
        bookingSource: req.user?.role === 'patient' ? 'online_portal' : 'walk_in',
        status,
        notes,
        confirmedAt: status === 'confirmed' ? new Date() : null
      }
    });

    await recordAuditLog(
      req.user?.name || patientName,
      'APPOINTMENT_BOOK',
      'Scheduling',
      id,
      `Booked appointment with ${doctorName} on ${date} at ${slotTime} (Status: ${status})`
    );

    res.status(201).json(newAppointment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Status (Check-in, Reschedule, Cancel)
router.patch('/:id/status', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status }
    });

    await recordAuditLog(
      req.user?.name || 'Staff',
      'APPOINTMENT_STATUS_CHANGE',
      'Scheduling',
      req.params.id,
      `Appointment status changed to ${status}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
