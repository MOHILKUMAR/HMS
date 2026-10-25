import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Hospital Expenses
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.hospitalExpense.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Log Operating Expense
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { date, category, supplierOrVendor, invoiceNumber, amount, paymentMode, description } = req.body;

  try {
    const count = await prisma.hospitalExpense.count();
    const id = `EXP-2026-${(count + 1).toString().padStart(2, '0')}`;

    const expense = await prisma.hospitalExpense.create({
      data: {
        id,
        date: date || new Date().toISOString().split('T')[0],
        category,
        supplierOrVendor,
        invoiceNumber,
        amount: Number(amount),
        paymentMode,
        status: 'pending_approval',
        description
      }
    });

    await recordAuditLog(
      req.user?.name || 'Staff',
      'EXPENSE_LOGGED',
      'Expenses',
      id,
      `Logged expense of ₹${amount} for ${supplierOrVendor}`
    );

    res.status(201).json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
