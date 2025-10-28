
import React, { useState, useMemo } from 'react';
import type { UserDetails, DailyRequirements, FoodLog, NutritionalInfo, DashboardTab } from '../types';
import AIToolbox from './AIToolbox';
import LogView from './LogView';

interface DashboardProps {
  userDetails: UserDetails;
  dailyRequirements: DailyRequirements;
  foodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
  resetApp: () => void;
}

const StatCard: React.FC<{ label: string; value: number; total: number; unit: string; color: string }> = ({ label, value, total, unit, color }) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
          <span className={`font-bold text-xl text-${color}-500`}>{Math.round(value)}</span>
        </div>
        <div className="text-right text-sm text-gray-400 dark:text-gray-500">/ {Math.round(total)} {unit}</div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
        <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ userDetails, dailyRequirements, foodLogs, addFoodLog, resetApp }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('Today');

  const todaysLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return foodLogs.filter(log => new Date(log.timestamp) >= today);
  }, [foodLogs]);

  const todaysNutrition: NutritionalInfo = useMemo(() => {
    return todaysLogs.reduce((acc, log) => {
      acc.calories += log.nutrition.calories;
      acc.protein += log.nutrition.protein;
      acc.carbohydrates += log.nutrition.carbohydrates;
      acc.fat += log.nutrition.fat;
      return acc;
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, portionSize: '' });
  }, [todaysLogs]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">Your Dashboard</h1>
        <button onClick={resetApp} className="text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition">Reset Profile</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Today's Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Calories" value={todaysNutrition.calories} total={dailyRequirements.calories} unit="kcal" color="blue" />
              <StatCard label="Protein" value={todaysNutrition.protein} total={dailyRequirements.protein} unit="g" color="green" />
              <StatCard label="Carbs" value={todaysNutrition.carbohydrates} total={dailyRequirements.carbohydrates} unit="g" color="yellow" />
              <StatCard label="Fat" value={todaysNutrition.fat} total={dailyRequirements.fat} unit="g" color="purple" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
             <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['Today', 'Weekly', 'Monthly'] as DashboardTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <LogView foodLogs={foodLogs} activeTab={activeTab} />
          </div>

        </div>

        <div className="lg:col-span-1">
          <AIToolbox addFoodLog={addFoodLog} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;