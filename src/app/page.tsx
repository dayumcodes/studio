
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { FoodRecognitionForm } from '@/components/food-recognition-form';
import { FoodDisplay } from '@/components/food-display';
import { CalorieHistory } from '@/components/calorie-history';
import { AdSenseUnit } from '@/components/adsense-unit';
import { CalorieProgressRing } from '@/components/calorie-progress-ring';
import { CalorieGoalAdjuster } from '@/components/calorie-goal-adjuster';
import useLocalStorage from '@/hooks/use-local-storage';
import type { FoodItem, CalorieLogEntry } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isToday, parseISO } from 'date-fns';

const HISTORY_STORAGE_KEY = 'calorieCamHistory';
const GOAL_STORAGE_KEY = 'calorieCamGoal';
const DEFAULT_DAILY_GOAL = 2000;

// TODO: Replace with your actual AdSense IDs, preferably via environment variables
const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX"; 
const ADSENSE_AD_SLOT_ID = "YYYYYYYYYY";

export default function HomePage() {
  const [currentMealData, setCurrentMealData] = useState<FoodItem[] | null>(null);
  const [isLoadingMeal, setIsLoadingMeal] = useState(false); 
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [history, setHistory] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const [dailyGoalCalories, setDailyGoalCalories] = useLocalStorage<number>(GOAL_STORAGE_KEY, DEFAULT_DAILY_GOAL);
  
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
    setHistory(prevHistory => [newEntry, ...prevHistory]);
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

  const [consumedToday, setConsumedToday] = useState(0);

  useEffect(() => {
    const todayEntries = history.filter(entry => isToday(parseISO(entry.date)));
    const totalConsumed = todayEntries.reduce((sum, entry) => sum + entry.totalCalories, 0);
    setConsumedToday(totalConsumed);
  }, [history]);

  const handleNewGoalSet = (newGoal: number) => {
    setDailyGoalCalories(newGoal);
    toast({
      title: "Goal Updated!",
      description: `Your new daily calorie goal is ${newGoal.toFixed(0)} kcal.`,
      variant: "default"
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
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
          <div className="lg:sticky lg:top-28 space-y-8">
            <CalorieProgressRing 
              consumedCalories={consumedToday}
              goalCalories={dailyGoalCalories}
              className="mx-auto" 
            />
            <CalorieGoalAdjuster
              consumedCalories={consumedToday}
              currentGoalCalories={dailyGoalCalories}
              onNewGoalSet={handleNewGoalSet}
            />
            <CalorieHistory 
              history={history} 
              onClearEntry={handleClearEntry} 
              onClearAllHistory={handleClearAllHistory} 
            />
             <div className="mt-8 py-6">
              <AdSenseUnit
                adClient={ADSENSE_CLIENT_ID}
                adSlot={ADSENSE_AD_SLOT_ID}
                className="mx-auto"
                style={{ display: 'block', minHeight: '250px', textAlign: 'center' }}
                adFormat="auto"
                fullWidthResponsive={true}
                data-ai-hint="advertisement banner"
              />
            </div>
          </div>
        </div>
        
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60 bg-card">
        © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
      </footer>
    </div>
  );
}
