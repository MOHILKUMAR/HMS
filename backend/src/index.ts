import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import opdRoutes from './routes/opd.routes.js';
import ipdRoutes from './routes/ipd.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import otRoutes from './routes/ot.routes.js';
import radiologyRoutes from './routes/radiology.routes.js';
import labRoutes from './routes/lab.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import billingRoutes from './routes/billing.routes.js';
import staffRoutes from './routes/staff.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import downtimeRoutes from './routes/downtime.routes.js';
import reportRoutes from './routes/report.routes.js';
import auditRoutes from './routes/audit.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint for Render/Railway monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Swastik Hospital Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register all 15 module endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ot', otRoutes);
app.use('/api/radiology', radiologyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/downtime', downtimeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

app.listen(PORT, () => {
  console.log(`🏥 Swastik Hospital Backend API running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/health`);
});

export default app;
