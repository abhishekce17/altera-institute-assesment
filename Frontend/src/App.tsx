import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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

export function App() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

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

  // Fetch data whenever user arrives at the Home screen and is authenticated
  useEffect(() => {
    if (location.pathname === '/home' && isAuthenticated) {
      refreshTasks();
    }
  }, [location.pathname, refreshTasks, isAuthenticated]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    return searchParams.get('modal') === 'add' || searchParams.get('modal') === 'edit';
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
    navigate('/home');
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
      <Routes>
        <Route
          path="/"
          element={
            user?.hasOnboarded ? (
              <Navigate to="/home" replace />
            ) : (
              <OnboardingScreen onGetStarted={handleGetStarted} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={<OnboardingScreen onGetStarted={handleGetStarted} />}
        />
        <Route
          path="/home"
          element={
            <HomeScreen
              tasks={displayedTasks}
              weeklyStats={weeklyStats}
              selectedDate={selectedDate}
              showAllTasks={showAllTasks}
              onSelectDate={setSelectedDate}
              onToggleShowAll={() => setShowAllTasks(!showAllTasks)}
              onSearchClick={() => navigate('/search')}
              onNotificationClick={() => navigate('/notifications')}
              onSettingsClick={() => navigate('/settings')}
              onAddTaskClick={handleOpenAddTask}
              onToggleStatus={toggleTaskStatus}
              onEditTask={handleOpenEditTask}
              onDeleteTask={deleteTask}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchScreen
              tasks={tasks}
              onBack={() => navigate('/home')}
              onToggleStatus={toggleTaskStatus}
              onEdit={handleOpenEditTask}
              onDelete={deleteTask}
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <NotificationScreen
              tasks={tasks}
              onBack={() => navigate('/home')}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsScreen
              onBack={() => navigate('/home')}
              onRefreshData={refreshTasks}
            />
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

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
