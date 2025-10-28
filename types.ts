
export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  portionSize: string;
}

export interface UserDetails {
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface DailyRequirements extends NutritionalInfo {}

export interface FoodLog {
  id: string;
  name: string;
  timestamp: number;
  nutrition: NutritionalInfo;
  image: string; // base64 image data
}

export interface AIQuestion {
  question: string;
  options: string[];
}

export interface AIAnalysisResponse {
  dishName: string;
  estimatedNutrition: NutritionalInfo;
  clarifyingQuestions: AIQuestion[];
}


export interface IngredientAnalysis {
  name: string;
  healthImpact: 'good' | 'neutral' | 'bad';
  explanation: string;
}

export interface GroceryAnalysisResponse {
  itemName: string;
  healthMentorSummary: string;
  ingredients: IngredientAnalysis[];
  healthyAlternatives: string[];
}

export type AppView = 'setup' | 'dashboard';
export type DashboardTab = 'Today' | 'Weekly' | 'Monthly';

export enum AnalysisStatus {
  IDLE = 'idle',
  ANALYZING = 'analyzing',
  AWAITING_ANSWERS = 'awaiting_answers',
  REFINING = 'refining',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export type AITool = 'meal_logger' | 'grocery_mentor';
