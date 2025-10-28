
import React, { useMemo } from 'react';
import type { FoodLog, DashboardTab } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface LogViewProps {
  foodLogs: FoodLog[];
  activeTab: DashboardTab;
}

const LogView: React.FC<LogViewProps> = ({ foodLogs, activeTab }) => {
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeTab) {
      case 'Today':
        return foodLogs.filter(log => new Date(log.timestamp) >= today);
      case 'Weekly':
        const oneWeekAgo = new Date(today.valueOf() - 6 * 24 * 60 * 60 * 1000);
        return foodLogs.filter(log => new Date(log.timestamp) >= oneWeekAgo);
      case 'Monthly':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return foodLogs.filter(log => new Date(log.timestamp) >= firstDayOfMonth);
      default:
        return [];
    }
  }, [foodLogs, activeTab]);

  const chartData = useMemo(() => {
    if (activeTab === 'Today') return [];

    const formatKey = activeTab === 'Weekly' 
      ? (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' })
      : (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
    const aggregatedData: { [key: string]: { calories: number, protein: number, carbs: number, fat: number } } = {};

    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const key = formatKey(date);
      if (!aggregatedData[key]) {
        aggregatedData[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      aggregatedData[key].calories += log.nutrition.calories;
      aggregatedData[key].protein += log.nutrition.protein;
      aggregatedData[key].carbs += log.nutrition.carbohydrates;
      aggregatedData[key].fat += log.nutrition.fat;
    });
    
    return Object.keys(aggregatedData).map(key => ({
      name: key,
      Calories: Math.round(aggregatedData[key].calories),
      Protein: Math.round(aggregatedData[key].protein),
      Carbs: Math.round(aggregatedData[key].carbs),
      Fat: Math.round(aggregatedData[key].fat),
    })).reverse();

  }, [filteredLogs, activeTab]);


  return (
    <div className="space-y-4">
      {activeTab !== 'Today' && chartData.length > 0 && (
         <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="Calories" fill="#8884d8" />
                 </BarChart>
             </ResponsiveContainer>
         </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-full">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.length > 0 ? (
                filteredLogs.slice().reverse().map(log => (
                <li key={log.id} className="p-4 flex items-center space-x-4">
                    <img src={log.image} alt={log.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                    <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h4 className="text-md font-bold capitalize">{log.name}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-1 text-gray-600 dark:text-gray-300">
                        <span>C: <strong>{log.nutrition.calories.toFixed(0)}</strong></span>
                        <span>P: <strong>{log.nutrition.protein.toFixed(1)}g</strong></span>
                        <span>F: <strong>{log.nutrition.fat.toFixed(1)}g</strong></span>
                        <span>Cb: <strong>{log.nutrition.carbohydrates.toFixed(1)}g</strong></span>
                    </div>
                    </div>
                </li>
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">No meals logged for this period.</p>
            )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default LogView;
