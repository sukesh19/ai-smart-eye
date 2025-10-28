
import React, { useState } from 'react';
import type { UserDetails, DailyRequirements } from '../types';

interface BMICalculatorProps {
  onSetupComplete: (details: UserDetails, requirements: DailyRequirements) => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ onSetupComplete }) => {
  const [details, setDetails] = useState<UserDetails>({
    height: 175,
    weight: 70,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: name === 'height' || name === 'weight' || name === 'age' ? Number(value) : value }));
  };

  const calculateRequirements = () => {
    setError('');
    if (details.height <= 0 || details.weight <= 0 || details.age <= 0) {
        setError('Please enter valid height, weight, and age.');
        return;
    }
      
    // Harris-Benedict BMR Calculation
    let bmr;
    if (details.gender === 'male') {
      bmr = 88.362 + (13.397 * details.weight) + (4.799 * details.height) - (5.677 * details.age);
    } else {
      bmr = 447.593 + (9.247 * details.weight) + (3.098 * details.height) - (4.330 * details.age);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * activityMultipliers[details.activityLevel];

    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 500,
    };

    const targetCalories = tdee + goalAdjustments[details.goal];

    // Macronutrient split (40% Carbs, 30% Protein, 30% Fat)
    // FIX: Added portionSize to satisfy the DailyRequirements type.
    const requirements: DailyRequirements = {
      calories: Math.round(targetCalories),
      carbohydrates: Math.round((targetCalories * 0.40) / 4),
      protein: Math.round((targetCalories * 0.30) / 4),
      fat: Math.round((targetCalories * 0.30) / 9),
      portionSize: '',
    };
    
    onSetupComplete(details, requirements);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Welcome to AI Calorie Counter</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">Let's set up your profile to personalize your experience.</p>

        {error && <p className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-2 rounded-lg">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
            <input type="number" name="height" value={details.height} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
            <input type="number" name="weight" value={details.weight} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
            <input type="number" name="age" value={details.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
            <select name="gender" value={details.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Level</label>
            <select name="activityLevel" value={details.activityLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (light exercise/sports 1-3 days/week)</option>
              <option value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</option>
              <option value="active">Very active (hard exercise/sports 6-7 days a week)</option>
              <option value="very_active">Extra active (very hard exercise/sports & physical job)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Goal</label>
            <select name="goal" value={details.goal} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="lose">Weight Loss</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Weight Gain</option>
            </select>
          </div>
        </div>
        
        <button onClick={calculateRequirements} className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800">
          Calculate & Start Tracking
        </button>
      </div>
    </div>
  );
};

export default BMICalculator;
