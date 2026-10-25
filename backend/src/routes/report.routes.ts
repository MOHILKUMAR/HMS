import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth } from '../middleware/auth.js';

const router = Router();

// Hospital Aggregated Dashboard & Department Metrics
router.get('/summary', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const totalBeds = await prisma.bed.count();
    const occupiedBeds = await prisma.bed.count({ where: { status: 'occupied' } });
    const availableBeds = await prisma.bed.count({ where: { status: 'available' } });
    const cleaningBeds = await prisma.bed.count({ where: { status: 'cleaning_blocked' } });

    const opdTotal = await prisma.opdQueueToken.count();
    const opdWaiting = await prisma.opdQueueToken.count({ where: { status: 'waiting' } });
    const opdCompleted = await prisma.opdQueueToken.count({ where: { status: 'completed' } });

    const activeEmergencies = await prisma.emergencyCase.count({ where: { status: 'active' } });
    const scheduledOt = await prisma.otBooking.count({ where: { status: 'scheduled' } });

    const invoices = await prisma.invoice.findMany({
      select: { grandTotal: true, amountPaid: true, balanceDue: true }
    });

    const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

    res.json({
      beds: { total: totalBeds || 35, occupied: occupiedBeds, available: availableBeds, cleaning: cleaningBeds },
      opd: { total: opdTotal, waiting: opdWaiting, completed: opdCompleted },
      emergency: { active: activeEmergencies },
      ot: { scheduled: scheduledOt },
      finance: { totalBilled, totalCollected, totalOutstanding }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
