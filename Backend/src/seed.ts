import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { Notification } from './models/Notification.js';
import { hashPassword } from './utils/authUtils.js';
import { getTodayString, getWeekStart } from './utils/dateUtils.js';

function addDays(baseDateStr: string, days: number): string {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split('T')[0];
}

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    const email = 'user@test.com';
    const password = 'User123!';
    const name = 'Demo User';

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
    await Task.deleteMany({ userId });
    await Notification.deleteMany({ userId });

    const today = getTodayString();
    const tasks = [
      {
        title: 'Review System Architecture & Requirements',
        description: 'Analyzed product specifications, state management, and MongoDB schema designs.',
        date: addDays(today, -5),
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        priority: 'High' as const,
        status: 'completed' as const,
      },
      {
        title: 'Database Indexing & Auth Security Audit',
        description: 'Configured unique compound indexes, bcrypt salting, and secure HTTP-only cookies.',
        date: addDays(today, -3),
        startTime: '11:30 AM',
        endTime: '01:00 PM',
        priority: 'Medium' as const,
        status: 'completed' as const,
      },
      {
        title: 'Write Comprehensive API Documentation',
        description: 'Documented REST endpoints, request payloads, and status codes for evaluators.',
        date: addDays(today, -1),
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        priority: 'Low' as const,
        status: 'completed' as const,
      },
      {
        title: 'Refactor Swipe-To-Delete Component',
        description: 'Unified PointerEvents and click suppression to ensure smooth swiping.',
        date: addDays(today, -1),
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        priority: 'Medium' as const,
        status: 'pending' as const,
      },
      {
        title: 'Morning Daily Standup & Sprint Sync',
        description: 'Discussed blockers, milestone progress, and task assignments with team.',
        date: today,
        startTime: '09:30 AM',
        endTime: '10:30 AM',
        priority: 'Medium' as const,
        status: 'completed' as const,
      },
      {
        title: 'Feature Demonstration & Walkthrough',
        description: 'Live demonstration of task creation, bi-directional calendar navigation, and metrics.',
        date: today,
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        priority: 'High' as const,
        status: 'pending' as const,
      },
      {
        title: 'Verify Edge Cases & Responsive UI',
        description: 'Checked 375px mobile to 1440px desktop layouts with zero layout shifts.',
        date: today,
        startTime: '04:30 PM',
        endTime: '05:30 PM',
        priority: 'Low' as const,
        status: 'pending' as const,
      },
      {
        title: 'Automated E2E & Regression Test Run',
        description: 'Verify task lifecycle, token persistence, and optimistic cache mutations.',
        date: addDays(today, 1),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        priority: 'High' as const,
        status: 'pending' as const,
      },
      {
        title: 'Client Progress Review & Demo',
        description: 'Walkthrough of calendar strip, live metrics, and search functionality.',
        date: addDays(today, 3),
        startTime: '03:00 PM',
        endTime: '04:30 PM',
        priority: 'Medium' as const,
        status: 'pending' as const,
      },
      {
        title: 'Performance Profiling & Bundle Optimization',
        description: 'Analyze Vite chunk sizes, memoization hooks, and network payloads.',
        date: addDays(today, 5),
        startTime: '01:00 PM',
        endTime: '02:30 PM',
        priority: 'Low' as const,
        status: 'pending' as const,
      },
      {
        title: 'Sprint Retrospective & Next Roadmap Planning',
        description: 'Plan upcoming milestone sprints and review key deliverables.',
        date: addDays(today, 7),
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        priority: 'Medium' as const,
        status: 'pending' as const,
      },
    ];

    await Task.insertMany(
      tasks.map((t) => ({
        ...t,
        userId,
        weekStart: getWeekStart(t.date),
      }))
    );

    console.log(`[Seed] Seeded 11 tasks for ${user.email} (password: ${password}) in MongoDB Atlas!`);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
