import { useState } from 'react';
import { MobileContainer } from './components/layout/MobileContainer';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { HomeScreen } from './components/home/HomeScreen';

type Screen = 'onboarding' | 'home';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('todo_has_onboarded') === 'true' ? 'home' : 'onboarding';
    }
    return 'onboarding';
  });

  const handleGetStarted = () => {
    localStorage.setItem('todo_has_onboarded', 'true');
    setCurrentScreen('home');
  };

  return (
    <MobileContainer>
      {currentScreen === 'onboarding' ? (
        <OnboardingScreen onGetStarted={handleGetStarted} />
      ) : (
        <HomeScreen
          onSearchClick={() => console.log('[Search Clicked]')}
          onAddTaskClick={() => console.log('[Add Task Clicked]')}
        />
      )}
    </MobileContainer>
  );
}

export default App;
