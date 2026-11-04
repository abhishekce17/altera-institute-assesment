import { connectDB, disconnectDB } from './config/db.js';
import { Task } from './models/Task.js';
import { User } from './models/User.js';
import { hashPassword } from './utils/authUtils.js';
import { getTodayString, getWeekStart } from './utils/dateUtils.js';

const today = getTodayString();
const monday = getWeekStart(today);

// Parse year, month, day to generate dates for this week
const [year, month, day] = monday.split('-').map(Number);

function getDayOfWeek(offsetDays: number): string {
  const d = new Date(Date.UTC(year, month - 1, day + offsetDays));
  return d.toISOString().split('T')[0];
}

const sampleTasks = [
  {
    title: 'Finishing Wireframe',
    description: 'Complete high-fidelity mobile wireframes for the To-Do app in Figma',
    date: today,
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    priority: 'High',
    status: 'pending',
  },
  {
    title: 'Meeting with team',
    description: 'Weekly sprint planning and status sync with frontend and backend developers',
    date: today,
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    priority: 'Medium',
    status: 'pending',
  },
  {
    title: 'Buy a cat food',
    description: 'Get premium salmon and chicken pouches from pet store',
    date: today,
    startTime: '01:00 PM',
    endTime: '01:30 PM',
    priority: 'Low',
    status: 'completed',
  },
  {
    title: 'Finishing daily commission',
    description: 'Deliver the client branding revisions and icon assets',
    date: today,
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    priority: 'High',
    status: 'completed',
  },
  {
    title: 'Doing Homework',
    description: 'Study algorithm problem sets and graph traversal exercises',
    date: getDayOfWeek(1), // Tuesday of this week
    startTime: '04:30 PM',
    endTime: '06:00 PM',
    priority: 'Medium',
    status: 'pending',
  },
  {
    title: 'Design review presentation',
    description: 'Walk through design system and accessibility tokens with stakeholders',
    date: getDayOfWeek(2), // Wednesday of this week
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    priority: 'High',
    status: 'pending',
  },
  {
    title: 'Gym session',
    description: 'Upper body resistance training and core stability',
    date: getDayOfWeek(3), // Thursday of this week
    startTime: '07:00 AM',
    endTime: '08:15 AM',
    priority: 'Low',
    status: 'completed',
  },
  {
    title: 'Plan weekend trip',
    description: 'Book cabin and review hiking trail directions',
    date: getDayOfWeek(4), // Friday of this week
    startTime: '06:00 PM',
    endTime: '07:00 PM',
    priority: 'Low',
    status: 'pending',
  },
];

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing tasks and demo users...');
    await Task.deleteMany({});
    await User.deleteMany({ email: 'alex@example.com' });

    console.log('[Seed] Creating demo user in MongoDB...');
    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: hashPassword('password123'),
      preferences: {
        defaultPriority: 'Medium',
        notificationEnabled: true,
      },
    });
    console.log(`[Seed] Demo user created: ${demoUser.email} (_id: ${demoUser._id})`);

    console.log('[Seed] Inserting sample tasks linked to demo user...');
    for (const t of sampleTasks) {
      await Task.create({
        ...t,
        userId: demoUser._id,
        weekStart: getWeekStart(t.date),
      });
    }

    const count = await Task.countDocuments();
    console.log(`[Seed] Successfully seeded ${count} tasks in MongoDB for user ${demoUser.email}!`);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
