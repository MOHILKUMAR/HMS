import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Get Staff Users (12+ Individual Accounts)
router.get('/users', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        department: true,
        mfaEnabled: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Attendance
router.post('/attendance', verifyAuth, async (req: AuthRequest, res: Response) => {
  await recordAuditLog(
    req.user?.name || 'Staff Member',
    'ATTENDANCE_CHECKIN',
    'Staff Roster',
    req.user?.id || 'USR',
    `Attendance recorded at ${new Date().toLocaleTimeString()}`
  );
  res.json({ success: true, timestamp: new Date().toISOString() });
});

export default router;
