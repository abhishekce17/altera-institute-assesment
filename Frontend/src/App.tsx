import { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MobileContainer } from './components/layout/MobileContainer';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { NotificationScreen } from './components/notifications/NotificationScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { TaskModal } from './components/tasks/TaskModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { useAppStore } from './store/useAppStore';

export function App() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const openAddTask = useAppStore((state) => state.openAddTask);
  const isTaskModalOpen = useAppStore((state) => state.isTaskModalOpen);

  // Sync modal state from URL query parameter (e.g. ?modal=add)
  useEffect(() => {
    if (searchParams.get('modal') === 'add' && !isTaskModalOpen) {
      openAddTask();
    }
  }, [searchParams, isTaskModalOpen, openAddTask]);

  return (
    <MobileContainer>
      <Routes>
        <Route
          path="/"
          element={user?.hasOnboarded ? <Navigate to="/home" replace /> : <OnboardingScreen />}
        />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/notifications" element={<NotificationScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {/* Global Modals wired cleanly to Zustand and TanStack Query */}
      <TaskModal />
      <AuthModal />
    </MobileContainer>
  );
}

export default App;
