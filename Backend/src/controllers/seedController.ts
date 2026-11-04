import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Task, type TaskPriority, type TaskStatus } from '../models/Task.js';
import { Notification } from '../models/Notification.js';
import { getTodayString, getWeekStart } from '../utils/dateUtils.js';
import { hashPassword, createToken } from '../utils/authUtils.js';

function addDays(baseDateStr: string, days: number): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split('T')[0];
}

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
 * Seed endpoint for invigilators and evaluators.
 * Creates/resets a dedicated test user and populates tasks across distinct past, today, and future dates.
 * Accessible via POST or GET /api/seed.
 */
export async function seedInvigilatorData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const email = (req.body?.email || req.query?.email || 'invigilator@test.com').toString().toLowerCase().trim();
    const password = (req.body?.password || req.query?.password || 'Invigilator123!').toString();
    const name = (req.body?.name || req.query?.name || 'Test Invigilator').toString();

    // 1. Find or create the test user
    let user = await User.findOne({ email });
    const hashedPassword = hashPassword(password);

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.hasOnboarded = true;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        preferences: {
          defaultPriority: 'Medium',
          notificationEnabled: true,
        },
        hasOnboarded: true,
      });
    }

    const userId = user._id;

    // 2. Clear previous tasks & notifications for this test user for clean idempotency
    await Task.deleteMany({ userId });
    await Notification.deleteMany({ userId });

    // 3. Generate dates dynamically relative to current date
    const today = getTodayString();

    const seedTasksData: Array<{
      title: string;
      description: string;
      date: string;
      startTime: string;
      endTime: string;
      priority: TaskPriority;
      status: TaskStatus;
    }> = [
      // --- PAST DATES ---
      {
        title: 'Review System Architecture & Requirements',
        description: 'Analyzed product specifications, state management, and MongoDB schema designs.',
        date: addDays(today, -5),
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        priority: 'High',
        status: 'completed',
      },
      {
        title: 'Database Indexing & Auth Security Audit',
        description: 'Configured unique compound indexes, bcrypt salting, and secure HTTP-only cookies.',
        date: addDays(today, -3),
        startTime: '11:30 AM',
        endTime: '01:00 PM',
        priority: 'Medium',
        status: 'completed',
      },
      {
        title: 'Write Comprehensive API Documentation',
        description: 'Documented REST endpoints, request payloads, and status codes for evaluators.',
        date: addDays(today, -1),
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        priority: 'Low',
        status: 'completed',
      },
      {
        title: 'Refactor Swipe-To-Delete Component',
        description: 'Unified PointerEvents and click suppression to ensure smooth swiping.',
        date: addDays(today, -1),
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        priority: 'Medium',
        status: 'pending',
      },

      // --- TODAY ---
      {
        title: 'Morning Daily Standup & Sprint Sync',
        description: 'Discussed blockers, milestone progress, and task assignments with team.',
        date: today,
        startTime: '09:30 AM',
        endTime: '10:30 AM',
        priority: 'Medium',
        status: 'completed',
      },
      {
        title: 'SDE Evaluation & Feature Demonstration',
        description: 'Live demonstration of task creation, bi-directional calendar navigation, and metrics for invigilator.',
        date: today,
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        priority: 'High',
        status: 'pending',
      },
      {
        title: 'Verify Edge Cases & Responsive UI',
        description: 'Checked 375px mobile to 1440px desktop layouts with zero layout shifts.',
        date: today,
        startTime: '04:30 PM',
        endTime: '05:30 PM',
        priority: 'Low',
        status: 'pending',
      },

      // --- FUTURE DATES ---
      {
        title: 'Automated E2E & Regression Test Run',
        description: 'Verify task lifecycle, token persistence, and optimistic cache mutations.',
        date: addDays(today, 1),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        priority: 'High',
        status: 'pending',
      },
      {
        title: 'Client Progress Review & Demo',
        description: 'Walkthrough of calendar strip, live metrics, and search functionality.',
        date: addDays(today, 3),
        startTime: '03:00 PM',
        endTime: '04:30 PM',
        priority: 'Medium',
        status: 'pending',
      },
      {
        title: 'Performance Profiling & Bundle Optimization',
        description: 'Analyze Vite chunk sizes, memoization hooks, and network payloads.',
        date: addDays(today, 5),
        startTime: '01:00 PM',
        endTime: '02:30 PM',
        priority: 'Low',
        status: 'pending',
      },
      {
        title: 'Sprint Retrospective & Next Roadmap Planning',
        description: 'Plan upcoming milestone sprints and review key deliverables.',
        date: addDays(today, 7),
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        priority: 'Medium',
        status: 'pending',
      },
    ];

    // 4. Insert all tasks with computed weekStart
    const createdTasks = await Task.insertMany(
      seedTasksData.map((t) => ({
        ...t,
        userId,
        weekStart: getWeekStart(t.date),
      }))
    );

    // 5. Insert sample notifications
    await Notification.insertMany([
      {
        userId,
        title: 'Welcome, Invigilator!',
        message: 'Your evaluation test environment is ready with sample tasks across past, today, and future dates.',
        type: 'progress',
        isRead: false,
      },
      {
        userId,
        title: 'Task Completed',
        message: 'Morning Daily Standup & Sprint Sync was marked as completed.',
        type: 'task_completed',
        isRead: false,
      },
      {
        userId,
        title: 'Upcoming Task Reminder',
        message: 'SDE Evaluation & Feature Demonstration is scheduled for today at 02:00 PM.',
        type: 'reminder',
        isRead: true,
      },
    ]);

    // 6. Generate JWT auth token for instant login
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set HTTP-only Cookie so browser users are logged in immediately
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    // 7. Calculate summary stats
    const distinctDates = Array.from(new Set(seedTasksData.map((t) => t.date))).sort();
    const completedCount = seedTasksData.filter((t) => t.status === 'completed').length;
    const pendingCount = seedTasksData.filter((t) => t.status === 'pending').length;

    res.status(200).json({
      success: true,
      message: 'Invigilator test user and multi-date tasks seeded successfully into MongoDB Atlas.',
      credentials: {
        email,
        password,
      },
      token,
      user: user.toSafeJSON(),
      stats: {
        totalTasks: createdTasks.length,
        completed: completedCount,
        pending: pendingCount,
        pastDates: distinctDates.filter((d) => d < today),
        todayDate: today,
        futureDates: distinctDates.filter((d) => d > today),
      },
      distinctDates,
      tasks: createdTasks,
    });
  } catch (error) {
    next(error);
  }
}
