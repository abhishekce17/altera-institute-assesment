import { z } from 'zod';
import { isValidDateString } from '../utils/dateUtils.js';

export const createTaskSchema = z.object({
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
    .refine(isValidDateString, 'Invalid calendar date'),
  startTime: z
    .string({ required_error: 'Start time is mandatory' })
    .trim()
    .min(1, 'Start time cannot be empty'),
  endTime: z
    .string({ required_error: 'End time is mandatory' })
    .trim()
    .min(1, 'End time cannot be empty'),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
      .refine(isValidDateString, 'Invalid calendar date')
      .optional(),
    startTime: z.string().trim().min(1).optional(),
    endTime: z.string().trim().min(1).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['pending', 'completed']).optional(),
  })
  .strict();

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

