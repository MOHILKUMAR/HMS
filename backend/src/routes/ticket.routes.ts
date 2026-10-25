import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Get Support Tickets
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Support / Complaint Ticket
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
  const { uhid, patientName, category, priority, assignedToDepartment, subject, description } = req.body;

  try {
    const count = await prisma.supportTicket.count();
    const ticketNumber = `SW-TCK-${1000 + count + 1}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        uhid,
        patientName,
        category: category || 'facility',
        priority: priority || 'medium',
        assignedToDepartment: assignedToDepartment || 'General Maintenance',
        subject,
        description,
        status: 'open'
      }
    });

    await recordAuditLog(
      req.user?.name || 'Helpdesk',
      'TICKET_CREATED',
      'Support Helpdesk',
      ticketNumber,
      `Created ticket: ${subject}`
    );

    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
