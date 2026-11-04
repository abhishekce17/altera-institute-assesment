import { z } from 'zod';
import { isValidDateString, timeToMinutes, getTodayString } from '../utils/dateUtils.js';

const timeRegex = /^((0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)|([01]?\d|2[0-3]):[0-5][0-9])$/i;

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is mandatory' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .default(''),
    date: z
      .string({ required_error: 'Date is mandatory' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
      .refine(isValidDateString, 'Invalid calendar date')
      .refine((d) => d >= getTodayString(), 'Cannot create tasks on past dates'),
    startTime: z
      .string({ required_error: 'Start time is mandatory' })
      .trim()
      .regex(timeRegex, 'Start time must be formatted as HH:MM AM/PM or HH:MM (e.g. 09:00 AM)'),
    endTime: z
      .string({ required_error: 'End time is mandatory' })
      .trim()
      .regex(timeRegex, 'End time must be formatted as HH:MM AM/PM or HH:MM (e.g. 10:30 AM)'),
    priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
    status: z.enum(['pending', 'completed']).optional().default('pending'),
  })
  .refine(
    (data) => {
      const startMin = timeToMinutes(data.startTime);
      const endMin = timeToMinutes(data.endTime);
      if (startMin !== null && endMin !== null) {
        return endMin > startMin;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(200, 'Title cannot exceed 200 characters').optional(),
    description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
      .refine(isValidDateString, 'Invalid calendar date')
      .optional(),
    startTime: z.string().trim().regex(timeRegex, 'Invalid start time format').optional(),
    endTime: z.string().trim().regex(timeRegex, 'Invalid end time format').optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['pending', 'completed']).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startMin = timeToMinutes(data.startTime);
        const endMin = timeToMinutes(data.endTime);
        if (startMin !== null && endMin !== null) {
          return endMin > startMin;
        }
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const patchStatusSchema = z.object({
  status: z.enum(['pending', 'completed'], {
    required_error: "Status is required and must be 'pending' or 'completed'",
  }),
});

export const queryTaskSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type PatchStatusInput = z.infer<typeof patchStatusSchema>;
