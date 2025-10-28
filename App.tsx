
import React, { useState, useEffect, useMemo } from 'react';
import type { UserDetails, DailyRequirements, FoodLog, AppView } from './types';
import BMICalculator from './components/BMICalculator';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('setup');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [dailyRequirements, setDailyRequirements] = useState<DailyRequirements | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    try {
      const storedUserDetails = localStorage.getItem('userDetails');
      const storedRequirements = localStorage.getItem('dailyRequirements');
      const storedLogs = localStorage.getItem('foodLogs');

      if (storedUserDetails && storedRequirements) {
        setUserDetails(JSON.parse(storedUserDetails));
        setDailyRequirements(JSON.parse(storedRequirements));
        if (storedLogs) {
            setFoodLogs(JSON.parse(storedLogs));
        }
        setView('dashboard');
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.clear();
      setView('setup');
    }
  }, []);

  const handleSetupComplete = (details: UserDetails, requirements: DailyRequirements) => {
    setUserDetails(details);
    setDailyRequirements(requirements);
    localStorage.setItem('userDetails', JSON.stringify(details));
    localStorage.setItem('dailyRequirements', JSON.stringify(requirements));
    setView('dashboard');
  };
  
  const addFoodLog = (log: Omit<FoodLog, 'id' | 'timestamp'>) => {
    const newLog: FoodLog = {
        ...log,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
    const updatedLogs = [...foodLogs, newLog];
    setFoodLogs(updatedLogs);
    localStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
  };
  
  const resetApp = () => {
    localStorage.clear();
    setUserDetails(null);
    setDailyRequirements(null);
    setFoodLogs([]);
    setView('setup');
  };

  const MemoizedDashboard = useMemo(() => {
    if (view === 'dashboard' && userDetails && dailyRequirements) {
      return (
        <Dashboard
          userDetails={userDetails}
          dailyRequirements={dailyRequirements}
          foodLogs={foodLogs}
          addFoodLog={addFoodLog}
          resetApp={resetApp}
        />
      );
    }
    return null;
  }, [view, userDetails, dailyRequirements, foodLogs]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {view === 'setup' ? (
        <BMICalculator onSetupComplete={handleSetupComplete} />
      ) : MemoizedDashboard}
    </div>
  );
};

export default App;
