import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Radiology Worklist
router.get('/worklist', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { modality } = req.query;
  try {
    const worklist = await prisma.radiologyWorklistItem.findMany({
      where: modality && modality !== 'all' ? { modality: String(modality) } : undefined,
      orderBy: { scheduledDate: 'desc' }
    });
    res.json(worklist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Draft and Authorize Report Release
router.post('/report', verifyAuth, requireRole(['radiologist', 'admin']), async (req: AuthRequest, res: Response) => {
  const { id, findings, impression } = req.body;

  try {
    const updated = await prisma.radiologyWorklistItem.update({
      where: { id },
      data: {
        findings,
        impression,
        reportedBy: req.user?.name || 'Dr. M. K. Gupta',
        reportedAt: new Date(),
        status: 'authorized_released'
      }
    });

    await recordAuditLog(
      req.user?.name || 'Radiologist',
      'RADIOLOGY_REPORT_RELEASE',
      'Radiology',
      id,
      `Authorized radiology report released for ${updated.modality} (${updated.bodyPart})`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
