import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AuthRequest, verifyAuth, recordAuditLog } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'swastik_hospital_super_secret_jwt_key_2026';

// Staff Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    await recordAuditLog(user.name, 'STAFF_LOGIN', 'Authentication', user.id, `User logged in from ${req.ip}`);

    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Patient OTP Request
router.post('/otp/send', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  // Simulation: OTP 1234
  res.json({ success: true, message: 'OTP sent to +91 ' + mobile, testOtp: '1234' });
});

// Patient OTP Verify
router.post('/otp/verify', async (req, res) => {
  const { mobile, otp, patientName } = req.body;
  if (otp !== '1234' && otp.length !== 4) {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  try {
    let patient = await prisma.patient.findFirst({ where: { mobile } });
    if (!patient) {
      const count = await prisma.patient.count();
      const uhid = `SH-2026-${(count + 101).toString().padStart(5, '0')}`;
      patient = await prisma.patient.create({
        data: {
          uhid,
          name: patientName || 'Portal Patient',
          age: 30,
          gender: 'Female',
          mobile,
          address: 'Delhi NCR',
          emergencyContact: { name: 'Self', relation: 'Self', phone: mobile }
        }
      });
    }

    const token = jwt.sign(
      { id: patient.uhid, name: patient.name, email: `${mobile}@patient.swastik`, role: 'patient', department: 'Patient Portal' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, patient });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Profile
router.get('/me', verifyAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
