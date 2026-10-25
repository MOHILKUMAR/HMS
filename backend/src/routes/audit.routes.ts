import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth } from '../middleware/auth.js';

const router = Router();

// Get Immutable 180-Day Audit Trail (CERT-In Compliance)
router.get('/logs', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { module } = req.query;

  try {
    const logs = await prisma.auditLog.findMany({
      where: module && module !== 'all' ? { module: String(module) } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 200
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
