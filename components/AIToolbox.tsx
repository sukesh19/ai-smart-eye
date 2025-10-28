
import React, { useState } from 'react';
import type { FoodLog, AITool } from '../types';
import MealLogger from './MealLogger';
import GroceryMentor from './GroceryMentor';
import { CameraIcon } from './icons/CameraIcon';

interface AIToolboxProps {
    addFoodLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
}

const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const AIToolbox: React.FC<AIToolboxProps> = ({ addFoodLog }) => {
    const [activeTool, setActiveTool] = useState<AITool>('meal_logger');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg sticky top-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex justify-around" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTool('meal_logger')}
                        className={`w-1/2 flex justify-center items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTool === 'meal_logger' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <ClipboardDocumentListIcon className="h-5 w-5" /> Log Meal
                    </button>
                    <button
                        onClick={() => setActiveTool('grocery_mentor')}
                        className={`w-1/2 flex justify-center items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTool === 'grocery_mentor' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                         <CameraIcon className="h-5 w-5" /> Grocery Mentor
                    </button>
                </nav>
            </div>
            <div className="p-6">
                {activeTool === 'meal_logger' ? (
                    <MealLogger addFoodLog={addFoodLog} />
                ) : (
                    <GroceryMentor />
                )}
            </div>
        </div>
    );
};

export default AIToolbox;
