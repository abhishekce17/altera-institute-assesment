import mongoose, { Document, Schema } from 'mongoose';
import { getWeekStart } from '../utils/dateUtils.js';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'completed';

export interface ITask extends Document {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM" or "09:00"
  endTime: string; // e.g. "10:30 AM" or "10:30"
  priority: TaskPriority;
  status: TaskStatus;
  weekStart: string; // YYYY-MM-DD (Monday)
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is mandatory'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: String,
      required: [true, 'Task date is mandatory (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is mandatory'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is mandatory'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    weekStart: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Week start must be formatted as YYYY-MM-DD'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Pre-validate hook: compute weekStart automatically from date if date is modified
TaskSchema.pre('validate', function (next) {
  if (this.date) {
    this.weekStart = getWeekStart(this.date);
  }
  next();
});

// Indexes for high performance
TaskSchema.index({ date: 1 });
TaskSchema.index({ weekStart: 1, status: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
