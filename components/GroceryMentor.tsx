
import React, { useState, useRef } from 'react';
import { AnalysisStatus, GroceryAnalysisResponse } from '../types';
import { analyzeGroceryItem } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import CameraCapture from './CameraCapture';
import { CameraIcon } from './icons/CameraIcon';
import { PlusIcon } from './icons/PlusIcon';

const GroceryMentor: React.FC = () => {
    const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<GroceryAnalysisResponse | null>(null);
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
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            handleAnalysis(file);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalysis = async (file: File) => {
        setStatus(AnalysisStatus.ANALYZING);
        setError(null);
        try {
            const { base64, mimeType } = await fileToBase64(file);
            const result = await analyzeGroceryItem(base64, mimeType);
            setAnalysis(result);
            setStatus(AnalysisStatus.COMPLETE);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze item. Please try again.');
            setStatus(AnalysisStatus.ERROR);
        }
    };

    const resetState = () => {
        setStatus(AnalysisStatus.IDLE);
        setError(null);
        setImagePreview(null);
        setAnalysis(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const impactColor = (impact: 'good' | 'neutral' | 'bad') => {
        switch(impact) {
            case 'good': return 'bg-green-500';
            case 'neutral': return 'bg-yellow-500';
            case 'bad': return 'bg-red-500';
        }
    };

    const renderContent = () => {
        switch (status) {
            case AnalysisStatus.IDLE:
                return (
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Grocery Mentor</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scan a packaged item for health insights.</p>
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
                            <button onClick={triggerFileInput} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Upload Photo
                            </button>
                            <button onClick={() => setShowCamera(true)} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <CameraIcon className="-ml-1 mr-2 h-5 w-5" />
                                Use Camera
                            </button>
                        </div>
                    </div>
                );
            case AnalysisStatus.ANALYZING:
                 return (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
                        <p className="text-indigo-500 dark:text-indigo-400 font-medium">Scanning item...</p>
                    </div>
                );
            case AnalysisStatus.COMPLETE:
                return analysis && (
                    <div className="text-left space-y-4">
                        <h3 className="text-xl font-bold text-center">{analysis.itemName}</h3>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <p className="text-sm text-indigo-800 dark:text-indigo-200 italic">"{analysis.healthMentorSummary}"</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Ingredient Breakdown:</h4>
                            <ul className="space-y-2">
                                {analysis.ingredients.map(ing => (
                                    <li key={ing.name} className="flex items-center text-sm">
                                        <span className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${impactColor(ing.healthImpact)}`}></span>
                                        <span className="flex-grow">{ing.name}</span>
                                        <div className="relative group">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                             <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 right-0 transform translate-x-1/2">
                                                {ing.explanation}
                                             </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Healthier Swaps:</h4>
                             <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {analysis.healthyAlternatives.map(alt => <li key={alt}>{alt}</li>)}
                            </ul>
                        </div>
                        <button onClick={resetState} className="w-full mt-4 text-sm text-center text-indigo-600 dark:text-indigo-400 hover:underline">
                           Scan Another Item
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
                    <img src={imagePreview} alt="Item preview" className="rounded-lg w-full h-48 object-cover" />
                </div>
            )}
            
            <div className="min-h-[200px] flex items-center justify-center">
                {renderContent()}
            </div>
        </>
    );
};

export default GroceryMentor;
