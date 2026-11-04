import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${className}`}
      {...props}
    />
  );
};

export const TaskItemSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white border border-slate-100/90 p-3.5 md:p-4 flex items-center justify-between gap-3 my-2 animate-pulse select-none">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Checkbox Skeleton */}
        <div className="w-6 h-6 bg-slate-200 shrink-0" />

        {/* Task Info Skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-slate-200 w-2/5" />
          <div className="flex items-center gap-2">
            <div className="h-3 bg-slate-100 w-24" />
            <div className="h-4 bg-slate-100 w-12" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-7 h-7 bg-slate-100" />
        <div className="w-7 h-7 bg-slate-100" />
      </div>
    </div>
  );
};

export const TaskListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <TaskItemSkeleton key={i} />
      ))}
    </div>
  );
};

export const NotificationItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 border border-slate-100 bg-white flex items-start gap-3.5 animate-pulse">
      {/* Icon Badge Skeleton */}
      <div className="w-8 h-8 bg-slate-200 shrink-0" />

      {/* Message Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 bg-slate-200 w-1/3" />
          <div className="h-3 bg-slate-100 w-14" />
        </div>
        <div className="h-3 bg-slate-100 w-3/4" />
      </div>
    </div>
  );
};

export const NotificationListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationItemSkeleton key={i} />
      ))}
    </div>
  );
};

export const SummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 md:px-0 py-2 animate-pulse">
      <div className="bg-slate-50/80 border border-slate-100 p-4 space-y-2">
        <div className="h-3 bg-slate-200 w-1/2" />
        <div className="h-7 bg-slate-200 w-1/3" />
        <div className="h-2 bg-slate-100 w-3/4" />
      </div>
      <div className="bg-slate-50/80 border border-slate-100 p-4 space-y-2">
        <div className="h-3 bg-slate-200 w-1/2" />
        <div className="h-7 bg-slate-200 w-1/3" />
        <div className="h-2 bg-slate-100 w-3/4" />
      </div>
    </div>
  );
};

export const ProgressBarSkeleton: React.FC = () => {
  return (
    <div className="px-5 md:px-0 py-2 animate-pulse">
      <div className="bg-slate-50/80 border border-slate-100 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-slate-200 w-24" />
          <div className="h-4 bg-slate-200 w-10" />
        </div>
        <div className="h-2 bg-slate-200 w-full" />
      </div>
    </div>
  );
};

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Section Skeleton */}
      <div className="border border-slate-200 p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="h-3.5 bg-slate-200 w-28 mb-1.5" />
          <div className="h-2.5 bg-slate-100 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 w-20" />
            <div className="h-9 bg-slate-100 border border-slate-200 w-full" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 w-24" />
            <div className="h-9 bg-slate-100 border border-slate-200 w-full" />
          </div>
        </div>
      </div>

      {/* Preferences Section Skeleton */}
      <div className="border border-slate-200 p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="h-3.5 bg-slate-200 w-32 mb-1.5" />
          <div className="h-2.5 bg-slate-100 w-44" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 w-36 mb-2" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-9 bg-slate-100 border border-slate-200" />
            <div className="h-9 bg-slate-100 border border-slate-200" />
            <div className="h-9 bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-10 bg-slate-200 w-36" />
    </div>
  );
};
