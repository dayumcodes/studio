
"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { FoodRecognitionForm } from '@/components/food-recognition-form';
import { FoodDisplay } from '@/components/food-display';
import { CalorieHistory } from '@/components/calorie-history';
import { AdSenseUnit } from '@/components/adsense-unit';
import useLocalStorage from '@/hooks/use-local-storage';
import type { FoodItem, CalorieLogEntry } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const HISTORY_STORAGE_KEY = 'calorieCamHistory';

// TODO: Replace with your actual AdSense IDs, preferably via environment variables
const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX"; 
const ADSENSE_AD_SLOT_ID = "YYYYYYYYYY";

export default function HomePage() {
  const [currentMealData, setCurrentMealData] = useState<FoodItem[] | null>(null);
  const [isLoadingMeal, setIsLoadingMeal] = useState(false); 
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [history, setHistory] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const { toast } = useToast();

  const handleMealDataProcessed = (data: FoodItem[]) => {
    setCurrentMealData(data);
    setIsLoadingMeal(false);
    setProcessingError(null);
    if (data.length > 0) {
      toast({
        title: "Meal Analyzed!",
        description: "Nutritional information is ready below.",
        variant: "default", 
      });
    } else {
       toast({
        title: "No food found",
        description: "We couldn't identify any food in the image.",
        variant: "destructive",
      });
    }
  };

  const handleProcessingError = (message: string) => {
    setProcessingError(message);
    setCurrentMealData(null);
    setIsLoadingMeal(false);
     if (message) {
       toast({
        title: "Processing Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const clearCurrentMeal = () => {
    setCurrentMealData(null);
    setProcessingError(null);
  }

  const handleLogMeal = (mealItems: FoodItem[], totals: { calories: number; protein: number; fat: number; carbs: number }) => {
    if (!mealItems || mealItems.length === 0) {
      toast({
        title: "Cannot Log Empty Meal",
        description: "There are no items to log.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: CalorieLogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mealItems,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalFat: totals.fat,
      totalCarbohydrates: totals.carbs,
    };
    setHistory(prevHistory => [...prevHistory, newEntry]);
    toast({
      title: "Meal Logged!",
      description: `Successfully added ${totals.calories.toFixed(0)} calories to your history.`,
      variant: "default",
    });
  };

  const handleClearEntry = (id: string) => {
    setHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
    toast({
      title: "Entry Removed",
      description: "The selected meal has been removed from your history.",
    });
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All your logged meals have been removed.",
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <FoodRecognitionForm 
              onMealDataProcessed={handleMealDataProcessed} 
              onProcessingError={handleProcessingError}
              clearCurrentMeal={clearCurrentMeal}
            />
            {processingError && !currentMealData && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Recognition Failed</AlertTitle>
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}
            <FoodDisplay 
              mealData={currentMealData} 
              isLoading={isLoadingMeal && !currentMealData} 
              onLogMeal={handleLogMeal}
            />
          </div>
          <div className="lg:sticky lg:top-24"> 
            <CalorieHistory 
              history={history} 
              onClearEntry={handleClearEntry} 
              onClearAllHistory={handleClearAllHistory} 
            />
          </div>
        </div>
        
        <div className="mt-12 mb-8 py-6 border-y border-border/60 bg-muted/30 rounded-lg shadow">
          <AdSenseUnit
            adClient={ADSENSE_CLIENT_ID} // Replace with your AdSense Client ID
            adSlot={ADSENSE_AD_SLOT_ID}   // Replace with your AdSense Ad Slot ID
            className="mx-auto" // Center the ad unit
            style={{ display: 'block', minHeight: '90px', textAlign: 'center' }} // Ensure it has some dimensions
            adFormat="auto"
            fullWidthResponsive={true}
            data-ai-hint="advertisement banner"
          />
        </div>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60">
        © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
      </footer>
    </div>
  );
}
