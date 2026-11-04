import { useState, useEffect } from 'react';
import { MobileContainer } from './components/layout/MobileContainer';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { NotificationScreen } from './components/notifications/NotificationScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { TaskModal, type TaskFormData } from './components/tasks/TaskModal';
import { AuthModal } from './components/auth/AuthModal';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './context/AuthContext';
import type { Task } from './types/task';

type Screen = 'onboarding' | 'home' | 'search' | 'notifications' | 'settings';

export function App() {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen') as Screen | null;
      if (screenParam && ['onboarding', 'home', 'search', 'notifications', 'settings'].includes(screenParam)) {
        return screenParam;
      }
    }
    return 'onboarding';
  });

  // When user is authenticated and hasOnboarded is true in MongoDB, automatically show home screen
  useEffect(() => {
    if (user?.hasOnboarded && currentScreen === 'onboarding') {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('screen')) {
        setCurrentScreen('home');
      }
    }
  }, [user?.hasOnboarded, currentScreen]);

  const {
    tasks,
    displayedTasks,
    weeklyStats,
    selectedDate,
    showAllTasks,
    setSelectedDate,
    setShowAllTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    refreshTasks,
  } = useTasks();

  // Fetch data whenever user arrives at the Home screen or logs in
  useEffect(() => {
    if (currentScreen === 'home') {
      refreshTasks();
    }
  }, [currentScreen, refreshTasks, isAuthenticated]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('modal') === 'add' || params.get('modal') === 'edit';
    }
    return false;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingTaskSubmission, setPendingTaskSubmission] = useState<{
    formData: TaskFormData;
    isEditing: boolean;
    taskId?: string;
  } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleGetStarted = () => {
    // If logged in, persist hasOnboarded flag directly to MongoDB
    if (user) {
      updateProfile({ hasOnboarded: true }).catch((err) => {
        console.warn('[Onboarding] Failed to persist onboarding status to MongoDB:', err);
      });
    }
    setCurrentScreen('home');
  };

  // Open TaskModal freely - login is only required when submitting "Create Task"
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: TaskFormData): Promise<boolean> => {
    // If user is not authenticated, preserve the entered data and prompt for login
    if (!isAuthenticated) {
      setPendingTaskSubmission({
        formData,
        isEditing: Boolean(editingTask),
        taskId: editingTask?._id,
      });
      setIsAuthModalOpen(true);
      return false; // Prevent TaskModal from closing or resetting
    }

    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await addTask(formData);
    }
    setPendingTaskSubmission(null);
    setEditingTask(null);
    setIsModalOpen(false);
    return true;
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    if (pendingTaskSubmission) {
      const { formData, isEditing, taskId } = pendingTaskSubmission;
      try {
        if (isEditing && taskId) {
          await updateTask(taskId, formData);
        } else {
          await addTask(formData);
        }
      } catch (err) {
        console.error('[App] Failed to save pending task post-login:', err);
      } finally {
        setPendingTaskSubmission(null);
        setIsModalOpen(false);
        setEditingTask(null);
      }
    }
    await refreshTasks();
  };

  return (
    <MobileContainer>
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onGetStarted={handleGetStarted} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          tasks={displayedTasks}
          weeklyStats={weeklyStats}
          selectedDate={selectedDate}
          showAllTasks={showAllTasks}
          onSelectDate={setSelectedDate}
          onToggleShowAll={() => setShowAllTasks(!showAllTasks)}
          onSearchClick={() => setCurrentScreen('search')}
          onNotificationClick={() => setCurrentScreen('notifications')}
          onSettingsClick={() => setCurrentScreen('settings')}
          onAddTaskClick={handleOpenAddTask}
          onToggleStatus={toggleTaskStatus}
          onEditTask={handleOpenEditTask}
          onDeleteTask={deleteTask}
        />
      )}

      {currentScreen === 'search' && (
        <SearchScreen
          tasks={tasks}
          onBack={() => setCurrentScreen('home')}
          onToggleStatus={toggleTaskStatus}
          onEdit={handleOpenEditTask}
          onDelete={deleteTask}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationScreen tasks={tasks} onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onRefreshData={refreshTasks}
        />
      )}

      {/* Task Modal for Add and Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingTaskSubmission(null);
          setEditingTask(null);
        }}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        initialFormData={pendingTaskSubmission?.formData}
        defaultDate={selectedDate}
      />

      {/* Authentication Modal triggered on Create Task or Account access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        subtitle={
          pendingTaskSubmission
            ? 'Sign in or create an account to save and create your task'
            : undefined
        }
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
        onSuccess={handleAuthSuccess}
      />
    </MobileContainer>
  );
}

export default App;
