import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password is too long'),
  preferences: z
    .object({
      defaultPriority: z.enum(['Low', 'Medium', 'High']).optional(),
      notificationEnabled: z.boolean().optional(),
    })
    .optional(),
  hasOnboarded: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters').optional(),
  email: z.string().trim().email('Invalid email address format').toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password is too long').optional(),
  preferences: z
    .object({
      defaultPriority: z.enum(['Low', 'Medium', 'High']).optional(),
      notificationEnabled: z.boolean().optional(),
    })
    .optional(),
  hasOnboarded: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

