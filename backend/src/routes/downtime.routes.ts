import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Get Downtime Records
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.downtimeManualRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Log Offline Manual Entry
router.post('/log', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { patientName, phone, entryType, serviceRendered, amountCollected, paymentMode } = req.body;

  try {
    const tempRef = `OFFLINE-MAN-${Math.floor(Math.random() * 900) + 100}`;

    const record = await prisma.downtimeManualRecord.create({
      data: {
        tempReferenceId: tempRef,
        patientName,
        phone,
        entryType,
        attendingStaff: req.user?.name || 'Reception Desk',
        serviceRendered,
        amountCollected: Number(amountCollected),
        paymentMode,
        recordedTimestamp: new Date().toLocaleString()
      }
    });

    await recordAuditLog(
      req.user?.name || 'Offline Operator',
      'DOWNTIME_LOGGED',
      'Outage Mode',
      tempRef,
      `Manual entry logged for ${patientName} (Amount: ₹${amountCollected})`
    );

    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reconcile Offline Entry with Permanent Record
router.post('/reconcile', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { id, permanentUhid, invoiceId, reconciliationNotes } = req.body;

  try {
    const updated = await prisma.downtimeManualRecord.update({
      where: { id },
      data: {
        reconciled: true,
        reconciledPermanentUhid: permanentUhid,
        reconciledInvoiceId: invoiceId,
        reconciliationNotes
      }
    });

    await recordAuditLog(
      req.user?.name || 'Reconciliation Staff',
      'DOWNTIME_RECONCILED',
      'Outage Mode',
      updated.tempReferenceId,
      `Reconciled with UHID ${permanentUhid}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
