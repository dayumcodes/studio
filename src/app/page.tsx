
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { FoodRecognitionForm } from '@/components/food-recognition-form';
import { FoodDisplay } from '@/components/food-display';
import { CalorieHistory } from '@/components/calorie-history';
import { AdSenseUnit } from '@/components/adsense-unit';
import { CalorieProgressRing } from '@/components/calorie-progress-ring';
import { CalorieGoalAdjuster } from '@/components/calorie-goal-adjuster';
import { UserProfileSetupModal } from '@/components/user-profile-setup-modal';
import useLocalStorage from '@/hooks/use-local-storage';
import type { FoodItem, CalorieLogEntry, UserProfile } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isToday, parseISO } from 'date-fns';
import { 
  HISTORY_STORAGE_KEY, 
  GOAL_STORAGE_KEY, 
  USER_PROFILE_STORAGE_KEY, 
  PROFILE_SETUP_COMPLETE_KEY,
  DEFAULT_DAILY_GOAL,
  ADSENSE_CLIENT_ID,
  ADSENSE_AD_SLOT_ID
} from '@/lib/constants';


export default function HomePage() {
  const [currentMealData, setCurrentMealData] = useState<FoodItem[] | null>(null);
  const [isLoadingMeal, setIsLoadingMeal] = useState(false); 
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [history, setHistory, isHistoryInitialized] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const [dailyGoalCalories, setDailyGoalCalories, isGoalInitialized] = useLocalStorage<number>(GOAL_STORAGE_KEY, DEFAULT_DAILY_GOAL);
  
  const [userProfile, setUserProfile, isProfileInitialized] = useLocalStorage<UserProfile | null>(USER_PROFILE_STORAGE_KEY, null);
  const [hasCompletedProfileSetup, setHasCompletedProfileSetup, isSetupCompleteInitialized] = useLocalStorage<boolean>(PROFILE_SETUP_COMPLETE_KEY, false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isSetupCompleteInitialized && !hasCompletedProfileSetup) {
      setIsProfileModalOpen(true);
    }
  }, [hasCompletedProfileSetup, isSetupCompleteInitialized]);

  const handleSaveProfile = (data: UserProfile) => {
    setUserProfile(data);
    setHasCompletedProfileSetup(true);
    setIsProfileModalOpen(false);
    toast({
      title: "Profile Saved!",
      description: "Your information has been successfully saved. Welcome!",
      variant: "default",
    });
  };

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
        description: "We couldn't identify any food items in the image.",
        variant: "destructive",
      });
    }
  };

  const handleProcessingError = (message: string) => {
    setProcessingError(message);
    setCurrentMealData(null); // Clear previous meal data on error
    setIsLoadingMeal(false);
     if (message) { // Only toast if there's an actual message
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
      description: `Successfully added ~${totals.calories.toFixed(0)} calories to your history.`,
      variant: "default",
    });
    setCurrentMealData(null); // Clear the displayed meal after logging
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
    if (isHistoryInitialized) { // Only calculate if history is loaded
      const todayEntries = history.filter(entry => isToday(parseISO(entry.date)));
      const totalConsumed = todayEntries.reduce((sum, entry) => sum + entry.totalCalories, 0);
      setConsumedToday(totalConsumed);
    }
  }, [history, isHistoryInitialized]);

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
      <main className="flex-grow container mx-auto px-4 py-4 md:py-6">
        {(isSetupCompleteInitialized && isProfileInitialized) && ( // Ensure dependent hooks are initialized
          <UserProfileSetupModal 
            isOpen={isProfileModalOpen} 
            onSave={handleSaveProfile} 
          />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <FoodRecognitionForm 
              onMealDataProcessed={handleMealDataProcessed} 
              onProcessingError={handleProcessingError}
              clearCurrentMeal={clearCurrentMeal}
            />
            {processingError && !currentMealData && ( // Show general error if recognition fails completely
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Recognition Failed</AlertTitle>
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}
            <FoodDisplay 
              mealData={currentMealData} 
              isLoading={isLoadingMeal && !currentMealData} // Show skeleton only if loading and no data yet
              onLogMeal={handleLogMeal}
            />
          </div>

          {/* Sticky sidebar column */}
          <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6"> {/* Adjusted top for sticky header */}
            {isHistoryInitialized && isGoalInitialized && ( // Ensure dependent hooks are initialized
              <>
                <CalorieProgressRing 
                  consumedCalories={consumedToday}
                  goalCalories={dailyGoalCalories}
                  className="mx-auto shadow-lg" 
                  size={200} // Slightly larger for better visibility
                />
                <CalorieGoalAdjuster
                  consumedCalories={consumedToday}
                  currentGoalCalories={dailyGoalCalories}
                  onNewGoalSet={handleNewGoalSet}
                />
              </>
            )}
            {isHistoryInitialized && (
              <CalorieHistory 
                history={history} 
                onClearEntry={handleClearEntry} 
                onClearAllHistory={handleClearAllHistory} 
              />
            )}
             <div className="mt-6 py-3">
              <AdSenseUnit
                adClient={ADSENSE_CLIENT_ID}
                adSlot={ADSENSE_AD_SLOT_ID}
                className="mx-auto rounded-lg overflow-hidden" // Added rounded corners and overflow hidden
                style={{ display: 'block', minHeight: '200px', maxHeight: '250px', textAlign: 'center' }}
                adFormat="auto"
                fullWidthResponsive={true}
                data-ai-hint="advertisement banner"
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60 bg-card mt-auto">
        © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
      </footer>
    </div>
  );
}
