import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Inventory Catalog
router.get('/inventory', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: { batches: true },
      orderBy: { name: 'asc' }
    });
    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dispense Medicine (ACID Transaction with Batch Stock Decrement)
router.post('/dispense', verifyAuth, requireRole(['pharmacist', 'nurse', 'admin']), async (req: AuthRequest, res: Response) => {
  const { medicineId, batchNumber, quantity, uhid } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.inventoryBatch.findUnique({
        where: { batchNumber }
      });

      if (!batch || batch.currentStock < Number(quantity)) {
        throw new Error(`Insufficient stock in Batch ${batchNumber}. Available: ${batch?.currentStock || 0}`);
      }

      // 1. Decrement batch stock
      const updatedBatch = await tx.inventoryBatch.update({
        where: { batchNumber },
        data: { currentStock: { decrement: Number(quantity) } }
      });

      // 2. Decrement total item stock
      const updatedItem = await tx.inventoryItem.update({
        where: { id: medicineId },
        data: { totalStock: { decrement: Number(quantity) } }
      });

      return { updatedBatch, updatedItem };
    });

    await recordAuditLog(
      req.user?.name || 'Pharmacist',
      'PHARMACY_DISPENSE',
      'Pharmacy',
      uhid || 'COUNTER',
      `Dispensed ${quantity} units from Batch ${batchNumber}`
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Receive Inward Stock Batch
router.post('/inward-stock', verifyAuth, requireRole(['pharmacist', 'admin']), async (req: AuthRequest, res: Response) => {
  const { medicineName, category, batchNumber, expiryDate, quantity, mrp, supplier } = req.body;

  try {
    let item = await prisma.inventoryItem.findFirst({
      where: { name: { equals: medicineName, mode: 'insensitive' } }
    });

    if (!item) {
      item = await prisma.inventoryItem.create({
        data: {
          id: `MED-${Date.now()}`,
          name: medicineName,
          genericName: medicineName,
          category: category || 'tablet',
          unit: 'Pack / Strip',
          totalStock: 0,
          reorderLevel: 25
        }
      });
    }

    const batch = await prisma.$transaction(async (tx) => {
      const b = await tx.inventoryBatch.create({
        data: {
          itemId: item.id,
          batchNumber: batchNumber || `BAT-${Date.now().toString().slice(-5)}`,
          expiryDate,
          currentStock: Number(quantity),
          mrp: Number(mrp),
          purchaseRate: Number(mrp) * 0.7,
          supplier: supplier || 'MedPlus Pharma'
        }
      });

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { totalStock: { increment: Number(quantity) } }
      });

      return b;
    });

    await recordAuditLog(
      req.user?.name || 'Pharmacist',
      'STOCK_RECEIVE',
      'Pharmacy',
      batch.batchNumber,
      `Received ${quantity} units of ${medicineName} (Lot ${batch.batchNumber})`
    );

    res.status(201).json(batch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
