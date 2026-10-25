import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'swastik_hospital_super_secret_jwt_key_2026';

export const verifyAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default fallback to admin for local development/simulation if not provided
    req.user = {
      id: 'USR-001',
      name: 'Dr. Devendra Swastik',
      email: 'admin@swastikhospital.in',
      role: 'admin',
      department: 'Hospital Administration'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.includes('all') || req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Forbidden: Action requires one of the following roles: [${roles.join(', ')}]. Current role: ${req.user.role}` 
    });
  };
};

export const recordAuditLog = async (
  operatorName: string,
  action: string,
  module: string,
  recordId: string,
  details: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        operatorName,
        action,
        module,
        recordId,
        details,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('Failed to write audit log entry', err);
  }
};
