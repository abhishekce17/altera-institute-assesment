export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  priority: TaskPriority;
  status: TaskStatus;
  weekStart: string; // YYYY-MM-DD (Monday)
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  completed: number;
  open: number;
  total: number;
  progressPercentage: number;
}

export interface DayItem {
  dateString: string; // YYYY-MM-DD
  dayName: string; // Sun, Mon, Tue, etc.
  dayNumber: string; // 09, 10, 11, etc.
  isToday: boolean;
  isSelected: boolean;
}
