
import { GoogleGenAI, Type } from "@google/genai";
import type { AIAnalysisResponse, NutritionalInfo, GroceryAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const nutritionSchema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.NUMBER, description: 'Estimated calories in kcal.' },
        protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
        carbohydrates: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams.' },
        fat: { type: Type.NUMBER, description: 'Estimated fat in grams.' },
        portionSize: { type: Type.STRING, description: 'Estimated portion size, e.g., "1 cup" or "approx. 200g".' },
    },
    required: ['calories', 'protein', 'carbohydrates', 'fat', 'portionSize'],
};


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        dishName: { type: Type.STRING, description: 'The name of the identified dish.' },
        estimatedNutrition: nutritionSchema,
        clarifyingQuestions: {
            type: Type.ARRAY,
            description: "2-3 simple multiple-choice questions for the user to clarify preparation methods that significantly impact nutrition (e.g., frying method, added sugar).",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['question', 'options'],
            },
        },
    },
    required: ['dishName', 'estimatedNutrition', 'clarifyingQuestions'],
};


export const analyzeImageAndAskQuestions = async (base64Image: string, mimeType: string): Promise<AIAnalysisResponse> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    const textPart = {
        text: `Analyze this food image. Identify the dish, its main ingredients and estimate its portion size (e.g., 'approx. 250g' or '1 medium bowl'). Provide an estimated nutritional breakdown. Also, generate 2-3 simple, multiple-choice questions to clarify preparation methods that significantly impact nutrition. For example, 'How was this prepared? (Deep-fried, Pan-fried, Air-fried, Baked)' or 'Were any sugary sauces or dressings added? (Yes, No, A little)'. Return the analysis and the questions in the specified JSON format.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        }
    });
    
    try {
        const jsonString = response.text;
        const parsed: AIAnalysisResponse = JSON.parse(jsonString);
        return parsed;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Received invalid data from AI. Please try again.");
    }
};

export const refineNutritionAnalysis = async (dishName: string, answers: Record<string, string>, currentNutrition: NutritionalInfo): Promise<NutritionalInfo> => {
    const userAnswers = Object.entries(answers).map(([question, answer]) => `- ${question} -> ${answer}`).join('\n');
    
    const prompt = `Based on the previous analysis of "${dishName}" which had an initial estimate of ${JSON.stringify(currentNutrition)}, refine the nutritional estimate considering the following user answers:\n${userAnswers}\nProvide an updated, final nutritional breakdown in the specified JSON format. Only return the JSON object. Keep the portion size the same.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: nutritionSchema,
        }
    });

    try {
        const jsonString = response.text;
        const parsed: NutritionalInfo = JSON.parse(jsonString);
        return parsed;
    } catch (e) {
        console.error("Failed to parse refined Gemini response:", response.text);
        throw new Error("Received invalid refined data from AI. Please try again.");
    }
};

const groceryAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        itemName: { type: Type.STRING, description: "The name of the grocery item." },
        healthMentorSummary: { type: Type.STRING, description: "A friendly, conversational summary about the item's healthiness and advice for the user." },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    healthImpact: { type: Type.STRING, enum: ['good', 'neutral', 'bad'] },
                    explanation: { type: Type.STRING, description: "A brief explanation of why the ingredient has that health impact." }
                },
                required: ['name', 'healthImpact', 'explanation'],
            }
        },
        healthyAlternatives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 healthier alternative products or homemade options."
        }
    },
    required: ['itemName', 'healthMentorSummary', 'ingredients', 'healthyAlternatives'],
};

export const analyzeGroceryItem = async (base64Image: string, mimeType: string): Promise<GroceryAnalysisResponse> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    const textPart = {
        text: "You are a healthy life mentor. Analyze this image of a packaged food item. Identify the product name. List its key ingredients from the nutrition label if visible, or infer them if not. For each key ingredient, classify its health impact as 'good', 'neutral', or 'bad' and provide a brief explanation. Provide an overall summary as a health mentor, advising the user on whether to buy it. Finally, suggest 2-3 healthier alternative products or homemade options. Return the result in the specified JSON format.",
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: groceryAnalysisSchema,
        }
    });
    
    try {
        const jsonString = response.text;
        const parsed: GroceryAnalysisResponse = JSON.parse(jsonString);
        return parsed;
    } catch (e) {
        console.error("Failed to parse grocery Gemini response:", response.text);
        throw new Error("Received invalid data from AI. Please try again.");
    }
};
