import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Extract auth token from HTTP-only Cookie first, then fallback to Authorization: Bearer header.
 */
export function extractToken(req: Request): string | null {
  // 1. Check HTTP-only Cookie
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  // 2. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
}

/**
 * Mandatory authentication middleware. Requires a valid JWT in Cookie or Authorization header.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No session cookie or Authorization header provided.',
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please sign in again.',
      });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User account not found. It may have been removed.',
      });
      return;
    }

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware: if a cookie or Bearer token is provided, attaches req.user.
 * If not provided or invalid, execution continues without error.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user) {
          (req as AuthRequest).user = user;
        }
      }
    }
    next();
  } catch {
    next();
  }
}
