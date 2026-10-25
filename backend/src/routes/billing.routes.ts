import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Service Catalog
router.get('/catalog', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const catalog = await prisma.serviceCatalogItem.findMany({
      where: { isActive: true },
      orderBy: { department: 'asc' }
    });
    res.json(catalog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Invoices
router.get('/invoices', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lines: true,
        payments: true,
        refunds: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Itemized Invoice (Price Snapshotting)
router.post('/invoices', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { uhid, patientName, encounterId, admissionId, lines } = req.body;

  try {
    const count = await prisma.invoice.count();
    const id = `INV-2026-${(count + 403).toString().padStart(5, '0')}`;
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const subtotal = (lines as any[]).reduce((acc, l) => acc + (l.unitPrice * l.quantity), 0);

    const invoice = await prisma.invoice.create({
      data: {
        id,
        uhid,
        patientName,
        encounterId,
        admissionId,
        date,
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        grandTotal: subtotal,
        amountPaid: 0,
        balanceDue: subtotal,
        status: 'unpaid',
        lines: {
          create: (lines as any[]).map(l => ({
            serviceId: l.serviceId,
            description: l.description,
            category: l.category,
            unitPrice: Number(l.unitPrice),
            quantity: Number(l.quantity),
            total: Number(l.unitPrice) * Number(l.quantity)
          }))
        }
      },
      include: { lines: true }
    });

    await recordAuditLog(
      req.user?.name || 'Billing Desk',
      'INVOICE_CREATE',
      'Central Billing',
      id,
      `Generated invoice for ${patientName} (Total: ₹${subtotal})`
    );

    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record Payment Receipt
router.post('/payments', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { invoiceId, amount, method, transactionRef } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) throw new Error('Invoice not found');

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: Number(amount),
          method,
          transactionRef: transactionRef || `REC-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          receivedBy: req.user?.name || 'Cashier Desk'
        }
      });

      const newPaid = invoice.amountPaid + Number(amount);
      const newDue = Math.max(0, invoice.grandTotal - newPaid);
      const newStatus = newDue === 0 ? 'paid' : 'partially_paid';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newPaid,
          balanceDue: newDue,
          status: newStatus
        },
        include: { payments: true, lines: true }
      });

      return { payment, updatedInvoice };
    });

    await recordAuditLog(
      req.user?.name || 'Cashier',
      'PAYMENT_RECEIPT',
      'Central Billing',
      invoiceId,
      `Payment of ₹${amount} received via ${method.toUpperCase()} (${result.payment.transactionRef})`
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Authorize Financial Refund / Discount (Restricted to Finance Manager & Admin)
router.post('/refunds', verifyAuth, requireRole(['finance_manager', 'admin']), async (req: AuthRequest, res: Response) => {
  const { invoiceId, amount, reason } = req.body;

  try {
    const refund = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error('Invoice not found');

      const r = await tx.refund.create({
        data: {
          invoiceId,
          amount: Number(amount),
          reason,
          approvedBy: req.user?.name || 'Finance Head',
          date: new Date().toLocaleString()
        }
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'refunded' }
      });

      return r;
    });

    await recordAuditLog(
      req.user?.name || 'Finance Head',
      'REFUND_APPROVED',
      'Central Billing',
      invoiceId,
      `Refund of ₹${amount} authorized. Reason: ${reason}`
    );

    res.json(refund);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
