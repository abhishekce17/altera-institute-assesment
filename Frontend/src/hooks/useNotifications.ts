import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'reminder' | 'progress' | 'task_created' | 'task_completed';
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationItem[]> => {
      if (!isAuthenticated) return [];
      const data = await api.fetchNotifications();
      return (data || []) as NotificationItem[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 15, // 15 seconds fresh
    refetchInterval: isAuthenticated ? 15000 : false,
  });

  const notifications = isAuthenticated ? query.data || [] : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const clearAllMutation = useMutation({
    mutationFn: () => api.clearNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      queryClient.setQueryData(['notifications'], []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (prev = []) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (prev = []) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    clearAll: clearAllMutation.mutateAsync,
    isClearing: clearAllMutation.isPending,
    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    refetch: query.refetch,
  };
}

