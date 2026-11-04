import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { hashPassword, verifyPassword, createToken } from '../utils/authUtils.js';
import { getTodayString } from '../utils/dateUtils.js';
import type { AuthRequest } from '../middlewares/auth.js';

/**
 * Register a new user in MongoDB.
 * Also seeds starter tasks in MongoDB associated with this new user's _id.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, preferences } = req.body;

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
    });

    // Seed default starter tasks directly in MongoDB for the new user
    const today = getTodayString();
    await Task.insertMany([
      {
        userId: user._id,
        title: 'Finishing Wireframe',
        description: 'Complete high-fidelity wireframes in Figma',
        date: today,
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        priority: 'High',
        status: 'pending',
      },
      {
        userId: user._id,
        title: 'Meeting with team',
        description: 'Sprint planning and status sync',
        date: today,
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        priority: 'Medium',
        status: 'pending',
      },
      {
        userId: user._id,
        title: 'Buy a cat food',
        description: 'Get pet groceries and snacks',
        date: today,
        startTime: '01:00 PM',
        endTime: '01:30 PM',
        priority: 'Low',
        status: 'completed',
      },
    ]);

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered and persisted to MongoDB successfully',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate user credentials against MongoDB.
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

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
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

    res.status(200).json({
      success: true,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile details and preferences directly in MongoDB.
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

    const { name, email, password, preferences } = req.body;

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

