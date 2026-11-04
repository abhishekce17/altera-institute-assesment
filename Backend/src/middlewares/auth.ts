import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Mandatory authentication middleware. Requires a valid JWT in Authorization: Bearer <token>.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Authorization header.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
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
 * Optional authentication middleware: if a Bearer token is provided, attaches req.user.
 * If not provided or invalid, execution continues without error.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
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

