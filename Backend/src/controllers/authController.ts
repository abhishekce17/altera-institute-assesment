import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { hashPassword, verifyPassword, createToken } from '../utils/authUtils.js';
import { type AuthRequest, extractToken } from '../middlewares/auth.js';

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}

/**
 * Register a new user in MongoDB.
 * Sets HTTP-only authentication cookie. Clean user state without mock data.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, preferences, hasOnboarded } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in.',
      });
      return;
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences: {
        defaultPriority: preferences?.defaultPriority || 'Medium',
        notificationEnabled: preferences?.notificationEnabled !== false,
      },
      hasOnboarded: hasOnboarded === true,
    });

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set HTTP-only Cookie with CORS compatibility
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered and persisted to MongoDB successfully',
      token, // Also return in body for non-browser clients (curl / postman)
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate user credentials against MongoDB.
 * Sets HTTP-only authentication cookie.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set HTTP-only Cookie with CORS compatibility
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token, // Also return in body for non-browser clients
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log out user and clear HTTP-only session cookie.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Cookie removed.',
  });
}

/**
 * Fetch currently logged in user profile & preferences from MongoDB.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const token = extractToken(req);

    res.status(200).json({
      success: true,
      token: token || undefined,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile details, hasOnboarded status, and preferences directly in MongoDB.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const { name, email, password, preferences, hasOnboarded } = req.body;

    // Check email uniqueness if email is changing
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (emailTaken) {
        res.status(409).json({
          success: false,
          error: 'Email is already in use by another account.',
        });
        return;
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name.trim();
    }

    if (password) {
      user.password = hashPassword(password);
    }

    if (typeof hasOnboarded === 'boolean') {
      user.hasOnboarded = hasOnboarded;
    }

    if (preferences) {
      if (preferences.defaultPriority) {
        user.preferences.defaultPriority = preferences.defaultPriority;
      }
      if (typeof preferences.notificationEnabled === 'boolean') {
        user.preferences.notificationEnabled = preferences.notificationEnabled;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile and preferences updated in MongoDB successfully',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}
