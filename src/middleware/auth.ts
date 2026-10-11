import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';
import { verifySessionToken } from '../lib/sessionToken.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | any;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized: Missing or invalid authentication token. Please sign in.',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized: Empty bearer token.',
      code: 'AUTH_EMPTY'
    });
  }

  // 1. Try to verify as signed HMAC session token
  const sessionPayload = verifySessionToken(token);
  if (sessionPayload && sessionPayload.uid && sessionPayload.tenantId) {
    req.user = sessionPayload;
    req.dbUser = sessionPayload;
    return next();
  }

  // 2. Try to verify as standard Firebase ID token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.uid && decodedToken.email) {
      req.dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email, decodedToken.name);
    }
    return next();
  } catch (error) {
    console.error('[Auth Middleware] Invalid token presented:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid, unverified, or expired session token.',
      code: 'AUTH_INVALID'
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (token) {
      // 1. Try signed session token
      const sessionPayload = verifySessionToken(token);
      if (sessionPayload && sessionPayload.uid && sessionPayload.tenantId) {
        req.user = sessionPayload;
        req.dbUser = sessionPayload;
        return next();
      }

      // 2. Try Firebase ID token
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = decodedToken;
        if (decodedToken.uid && decodedToken.email) {
          req.dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email, decodedToken.name);
        }
      } catch {
        // Gracefully continue as unauthenticated guest
      }
    }
  }
  next();
};
