import { useEffect } from 'react';
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
import { useAppStore } from './store/useAppStore';

export function App() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Zustand Store for central UI and application modal/filter state
  const {
    selectedDate,
    showAllTasks,
    setSelectedDate,
    toggleShowAllTasks,
    isTaskModalOpen,
    editingTask,
    pendingTaskSubmission,
    openAddTask,
    openEditTask,
    closeTaskModal,
    isAuthModalOpen,
    authModalSubtitle,
    openAuthModal,
    closeAuthModal,
    setPendingTaskSubmission,
    clearPendingTaskSubmission,
  } = useAppStore();

  // TanStack Query & Mutations for server state synchronization with MongoDB Atlas
  const {
    tasks,
    displayedTasks,
    weeklyStats,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    refreshTasks,
  } = useTasks();

  // Sync modal state from URL search params on mount
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'add' && !isTaskModalOpen) {
      openAddTask();
    }
  }, [searchParams, isTaskModalOpen, openAddTask]);

  // Refetch latest tasks when navigating to /home
  useEffect(() => {
    if (location.pathname === '/home' && isAuthenticated) {
      refreshTasks();
    }
  }, [location.pathname, isAuthenticated, refreshTasks]);

  const handleGetStarted = () => {
    // If logged in, persist hasOnboarded flag directly to MongoDB
    if (user) {
      updateProfile({ hasOnboarded: true }).catch((err) => {
        console.warn('[Onboarding] Failed to persist onboarding status to MongoDB:', err);
      });
    }
    navigate('/home');
  };

  const handleModalSubmit = async (formData: TaskFormData): Promise<boolean> => {
    // If user is not authenticated, preserve the entered data in Zustand and prompt for login
    if (!isAuthenticated) {
      setPendingTaskSubmission({
        formData,
        isEditing: Boolean(editingTask),
        taskId: editingTask?._id,
      });
      openAuthModal('Sign in or create an account to save and create your task');
      return false; // Prevent TaskModal from closing or resetting inputs
    }

    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await addTask(formData);
    }
    clearPendingTaskSubmission();
    closeTaskModal();
    return true;
  };

  const handleAuthSuccess = async () => {
    closeAuthModal();
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
        clearPendingTaskSubmission();
        closeTaskModal();
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
              onToggleShowAll={toggleShowAllTasks}
              onSearchClick={() => navigate('/search')}
              onNotificationClick={() => navigate('/notifications')}
              onSettingsClick={() => navigate('/settings')}
              onAddTaskClick={openAddTask}
              onToggleStatus={toggleTaskStatus}
              onEditTask={openEditTask}
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
              onEdit={openEditTask}
              onDelete={deleteTask}
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <NotificationScreen
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
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        initialFormData={pendingTaskSubmission?.formData}
        defaultDate={selectedDate}
      />

      {/* Authentication Modal triggered on Create Task or Account access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        subtitle={authModalSubtitle}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </MobileContainer>
  );
}

export default App;
