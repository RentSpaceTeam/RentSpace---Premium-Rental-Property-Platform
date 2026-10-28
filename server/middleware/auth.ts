import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbStore, UserData } from '../store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'rentspace_production_vault_auth_secret_key_928340129';

// Extend Express Request to carry authenticated user
export interface AuthRequest extends Request {
  user?: UserData;
}

// Generate token: payload base64url + HMAC-SHA256 signature
export function generateToken(user: UserData): string {
  const payload = JSON.stringify({
    userId: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

// Verify token
export function verifyToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Authentication middleware
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }

  const user = await dbStore.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User account not found.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
  }

  req.user = user;
  next();
}

// Role-based authorization middleware
export function requireRole(...allowedRoles: Array<'tenant' | 'owner' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${req.user.role}.`
      });
    }

    next();
  };
}

// Optional auth middleware (identifies user if token is present, but allows guests)
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return next();
  }

  try {
    const user = await dbStore.findUserById(decoded.userId);
    if (user && user.status !== 'suspended') {
      req.user = user;
    }
  } catch {
    // Continue as guest
  }
  next();
}
