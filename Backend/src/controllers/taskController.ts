import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { getTodayString, getWeekEnd, getWeekStart } from '../utils/dateUtils.js';
import type { AuthRequest } from '../middlewares/auth.js';

/**
 * GET /api/tasks
 * Filter tasks by date, weekStart, status, or search keywords.
 * Strictly scoped to the authenticated user.
 */
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { date, weekStart, status, search } = req.query;

    const filter: Record<string, any> = {
      userId: user._id, // Enforce strict user-isolation
    };

    if (date && typeof date === 'string') {
      filter.date = date;
    }

    if (weekStart && typeof weekStart === 'string') {
      filter.weekStart = weekStart;
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = search.trim();
      filter.$and = [
        { userId: user._id },
        {
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
          ],
        },
      ];
    }

    // Sort by scheduled date ascending, then startTime ascending
    const tasks = await Task.find(filter).sort({ date: 1, startTime: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/stats/weekly
 * Returns open tasks count, completed tasks count, and progress percentage for a week.
 * Strictly scoped to the authenticated user.
 */
export async function getWeeklyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { date, weekStart } = req.query;

    let targetWeekStart: string;

    if (weekStart && typeof weekStart === 'string') {
      targetWeekStart = weekStart;
    } else if (date && typeof date === 'string') {
      targetWeekStart = getWeekStart(date);
    } else {
      targetWeekStart = getWeekStart(getTodayString());
    }

    const targetWeekEnd = getWeekEnd(targetWeekStart);

    const matchQuery: Record<string, any> = {
      userId: user._id,
      weekStart: targetWeekStart,
    };

    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const completed = stats.find((s) => s._id === 'completed')?.count || 0;
    const open = stats.find((s) => s._id === 'pending')?.count || 0;
    const total = completed + open;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        weekStart: targetWeekStart,
        weekEnd: targetWeekEnd,
        completed,
        open,
        total,
        progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id
 */
export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid task ID format' });
      return;
    }

    const task = await Task.findOne({ _id: id, userId: user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks
 */
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { title, description, date, startTime, endTime, priority, status } = req.body;

    const task = new Task({
      userId: user._id, // Enforce user ownership
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      status: status || 'pending',
      weekStart: getWeekStart(date),
    });

    const savedTask = await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully in MongoDB',
      data: savedTask,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tasks/:id
 */
export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid task ID format' });
      return;
    }

    const updates = { ...req.body };
    if (updates.date) {
      updates.weekStart = getWeekStart(updates.date);
    }
    delete updates.userId; // Prevent hijacking ownership

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: user._id },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTask) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully in MongoDB',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/status
 * Toggle or set specific status ('pending' | 'completed')
 */
export async function patchTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid task ID format' });
      return;
    }

    const task = await Task.findOne({ _id: id, userId: user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const newStatus = req.body?.status || (task.status === 'completed' ? 'pending' : 'completed');
    task.status = newStatus;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${newStatus} in MongoDB`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id
 */
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid task ID format' });
      return;
    }

    const deleted = await Task.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully from MongoDB',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
}
