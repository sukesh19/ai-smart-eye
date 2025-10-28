
import React, { useState, useRef } from 'react';
import type { FoodLog, NutritionalInfo, AIAnalysisResponse } from '../types';
import { AnalysisStatus } from '../types';
import { analyzeImageAndAskQuestions, refineNutritionAnalysis } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { CameraIcon } from './icons/CameraIcon';
import { PlusIcon } from './icons/PlusIcon';
import CameraCapture from './CameraCapture';


interface MealLoggerProps {
    addFoodLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
}

const MealLogger: React.FC<MealLoggerProps> = ({ addFoodLog }) => {
    const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
    const [finalNutrition, setFinalNutrition] = useState<NutritionalInfo | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };
    
    const handleCapture = (file: File) => {
        setShowCamera(false);
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        resetState();
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            handleInitialAnalysis(file);
        };
        reader.readAsDataURL(file);
    };
    
    const handleInitialAnalysis = async (file: File) => {
        setStatus(AnalysisStatus.ANALYZING);
        setError(null);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const result = await analyzeImageAndAskQuestions(base64, mimeType);
            setAnalysis(result);
            if(result.clarifyingQuestions && result.clarifyingQuestions.length > 0) {
                 setStatus(AnalysisStatus.AWAITING_ANSWERS);
            } else {
                 setFinalNutrition(result.estimatedNutrition);
                 setStatus(AnalysisStatus.COMPLETE);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to analyze image. Please try again.');
            setStatus(AnalysisStatus.ERROR);
        }
    };

    const handleAnswerChange = (question: string, option: string) => {
        setAnswers(prev => ({ ...prev, [question]: option }));
    };

    const handleRefinement = async () => {
        if (!analysis) return;
        setStatus(AnalysisStatus.REFINING);
        setError(null);
        try {
            const result = await refineNutritionAnalysis(analysis.dishName, answers, analysis.estimatedNutrition);
            setFinalNutrition(result);
            setStatus(AnalysisStatus.COMPLETE);
        } catch (err) {
            console.error(err);
            setError('Failed to refine analysis. Please try again.');
            setStatus(AnalysisStatus.ERROR);
        }
    };

    const handleLogMeal = () => {
        if (!finalNutrition || !analysis || !imagePreview) return;
        addFoodLog({
            name: analysis.dishName,
            nutrition: finalNutrition,
            image: imagePreview
        });
        resetState();
    };

    const resetState = () => {
        setStatus(AnalysisStatus.IDLE);
        setError(null);
        setImagePreview(null);
        setImageFile(null);
        setAnalysis(null);
        setFinalNutrition(null);
        setAnswers({});
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    const renderContent = () => {
        switch (status) {
            case AnalysisStatus.IDLE:
                return (
                     <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Log a Meal</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Take a photo or upload one.</p>
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
                            <button onClick={triggerFileInput} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Upload Photo
                            </button>
                             <button onClick={() => setShowCamera(true)} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <CameraIcon className="-ml-1 mr-2 h-5 w-5" />
                                Use Camera
                            </button>
                        </div>
                    </div>
                );
            case AnalysisStatus.ANALYZING:
            case AnalysisStatus.REFINING:
                return (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
                        <p className="text-indigo-500 dark:text-indigo-400 font-medium">{status === AnalysisStatus.ANALYZING ? 'Analyzing your meal...' : 'Refining analysis...'}</p>
                    </div>
                );
            case AnalysisStatus.AWAITING_ANSWERS:
                return analysis && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Just a few questions about your <span className="text-indigo-500">{analysis.dishName}</span>:</h3>
                        {analysis.clarifyingQuestions.map((q, i) => (
                            <div key={i}>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">{q.question}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {q.options.map(opt => (
                                        <button key={opt} onClick={() => handleAnswerChange(q.question, opt)} className={`px-3 py-1 rounded-full text-sm ${answers[q.question] === opt ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={handleRefinement} disabled={Object.keys(answers).length !== analysis.clarifyingQuestions.length} className="w-full mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Confirm Details
                        </button>
                    </div>
                );
            case AnalysisStatus.COMPLETE:
                return finalNutrition && analysis && (
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-center">{analysis.dishName}</h3>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">({finalNutrition.portionSize})</p>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            <li className="py-2 flex justify-between"><span>Calories:</span> <span className="font-bold">{finalNutrition.calories.toFixed(0)} kcal</span></li>
                            <li className="py-2 flex justify-between"><span>Protein:</span> <span className="font-bold">{finalNutrition.protein.toFixed(1)} g</span></li>
                            <li className="py-2 flex justify-between"><span>Carbs:</span> <span className="font-bold">{finalNutrition.carbohydrates.toFixed(1)} g</span></li>
                            <li className="py-2 flex justify-between"><span>Fat:</span> <span className="font-bold">{finalNutrition.fat.toFixed(1)} g</span></li>
                        </ul>
                        <button onClick={handleLogMeal} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                            Add to Daily Log
                        </button>
                        <button onClick={resetState} className="w-full mt-2 text-sm text-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            Analyze another meal
                        </button>
                    </div>
                );
            case AnalysisStatus.ERROR:
                 return (
                    <div className="text-center text-red-500">
                        <p>{error}</p>
                        <button onClick={resetState} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <>
            {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            {imagePreview && (
                <div className="mb-4">
                    <img src={imagePreview} alt="Meal preview" className="rounded-lg w-full h-48 object-cover" />
                </div>
            )}
            
            <div className="min-h-[200px] flex items-center justify-center">
                {renderContent()}
            </div>
        </>
    );
};

export default MealLogger;
