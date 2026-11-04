import { useState } from 'react';
import { MobileContainer } from './components/layout/MobileContainer';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { TaskModal, type TaskFormData } from './components/tasks/TaskModal';
import { useTasks } from './hooks/useTasks';
import type { Task } from './types/task';

type Screen = 'onboarding' | 'home' | 'search';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen') as Screen | null;
      if (screenParam && ['onboarding', 'home', 'search'].includes(screenParam)) {
        return screenParam;
      }
      return localStorage.getItem('todo_has_onboarded') === 'true' ? 'home' : 'onboarding';
    }
    return 'onboarding';
  });

  const {
    tasks,
    displayedTasks,
    weeklyStats,
    selectedDate,
    showAllTasks,
    isOnline,
    setSelectedDate,
    setShowAllTasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('modal') === 'add' || params.get('modal') === 'edit';
    }
    return false;
  });
  const [editingTask, setEditingTask] = useState<Task | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === 'edit') {
        return {
          _id: 'sample-1',
          title: 'Finishing Wireframe',
          description: 'High-fidelity wireframes in Figma',
          date: '2026-11-04',
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          priority: 'High',
          status: 'pending',
          weekStart: '2026-11-02',
        };
      }
    }
    return null;
  });

  const handleGetStarted = () => {
    localStorage.setItem('todo_has_onboarded', 'true');
    setCurrentScreen('home');
  };

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask._id, formData);
    } else {
      addTask(formData);
    }
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
          isOnline={isOnline}
          onSelectDate={setSelectedDate}
          onToggleShowAll={() => setShowAllTasks(!showAllTasks)}
          onSearchClick={() => setCurrentScreen('search')}
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

      {/* Task Modal for Add and Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        defaultDate={selectedDate}
      />
    </MobileContainer>
  );
}

export default App;
