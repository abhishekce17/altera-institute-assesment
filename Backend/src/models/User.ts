import mongoose, { Document, Schema } from 'mongoose';
import type { TaskPriority } from './Task.js';

export interface IUserPreferences {
  defaultPriority: TaskPriority;
  notificationEnabled: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  preferences: IUserPreferences;
  hasOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, any>;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    defaultPriority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User full name is mandatory'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is mandatory'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is mandatory'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({
        defaultPriority: 'Medium',
        notificationEnabled: true,
      }),
    },
    hasOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);

