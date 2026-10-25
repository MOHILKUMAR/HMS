import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Lab Tests
router.get('/tests', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { location } = req.query;
  try {
    const tests = await prisma.labTestItem.findMany({
      where: location && location !== 'all' ? { processingLocation: String(location) } : undefined,
      orderBy: { orderedAt: 'desc' }
    });
    res.json(tests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Collect Sample & Assign Barcode
router.post('/collect-sample', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.body;
  const barcodeId = `SPEC-2026-${Math.floor(Math.random() * 9000) + 1000}`;

  try {
    const updated = await prisma.labTestItem.update({
      where: { id },
      data: {
        specimenBarcodeId: barcodeId,
        status: 'sample_collected'
      }
    });

    await recordAuditLog(
      req.user?.name || 'Lab Staff',
      'LAB_SAMPLE_COLLECTED',
      'Laboratory',
      id,
      `Sample collected with barcode ${barcodeId}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Enter Results & Authorize Report
router.post('/enter-results', verifyAuth, requireRole(['lab_technician', 'admin']), async (req: AuthRequest, res: Response) => {
  const { id, parameterResults, overallImpression } = req.body;

  try {
    const updated = await prisma.labTestItem.update({
      where: { id },
      data: {
        parameterResults,
        overallImpression,
        authorizedSignatory: req.user?.name || 'Pathology Signatory',
        authorizedAt: new Date(),
        status: 'authorized_released'
      }
    });

    await recordAuditLog(
      req.user?.name || 'Pathologist',
      'LAB_REPORT_AUTHORIZED',
      'Laboratory',
      id,
      `Authorized lab report released for ${updated.testName}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
