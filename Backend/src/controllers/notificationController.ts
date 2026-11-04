import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import type { AuthRequest } from '../middlewares/auth.js';

/**
 * GET /api/notifications
 * Fetch real notifications for the authenticated user from MongoDB Atlas.
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/notifications
 * Clear all notifications for the authenticated user in MongoDB Atlas.
 */
export async function clearNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    await Notification.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared from MongoDB',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}
