

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { FoodRecognitionForm } from '@/components/food-recognition-form';
import { FoodDisplay } from '@/components/food-display';
import { CalorieHistory } from '@/components/calorie-history';
import { CalorieProgressRing } from '@/components/calorie-progress-ring'; 
import { UserProfileSetupModal } from '@/components/user-profile-setup-modal';
import useLocalStorage from '@/hooks/use-local-storage';
import type { FoodItem, CalorieLogEntry, UserProfile } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Flame, Brain, TrendingUp, Utensils, Leaf, Fish, AlertCircle, ChevronRight, Camera, UploadCloud, Loader2 } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';
import { 
  HISTORY_STORAGE_KEY, 
  GOAL_STORAGE_KEY, 
  USER_PROFILE_STORAGE_KEY, 
  PROFILE_SETUP_COMPLETE_KEY,
  DEFAULT_DAILY_GOAL,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { calculateBMR } from '@/lib/health-utils';

interface SummaryCardProps {
  title: string;
  value: string;
  goal?: string;
  icon: React.ReactElement;
  color: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const SummaryCard = ({ title, value, goal, icon, color, className, children, onClick }: SummaryCardProps) => (
  <Card 
    onClick={onClick} 
    className={cn(
      "shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden bg-card", 
      className, 
      onClick ? "cursor-pointer" : ""
    )}
  >
    <CardHeader className="pb-3 pt-4 px-4">
      <CardTitle className={cn("flex items-center justify-between text-md font-semibold", color)}>
        <span className="flex items-center gap-2">
          {React.cloneElement(icon, { className: cn("h-5 w-5", icon.props.className) })}
          {title}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {goal && <p className="text-xs text-muted-foreground">{goal}</p>}
      {children}
    </CardContent>
  </Card>
);

interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function HomePage(props: HomePageProps) {
  const [clientReady, setClientReady] = useState(false);

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
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (clientReady && isSetupCompleteInitialized && isProfileInitialized && !hasCompletedProfileSetup && !isProfileModalOpen) {
      setIsProfileModalOpen(true);
    }
  }, [clientReady, hasCompletedProfileSetup, isSetupCompleteInitialized, isProfileInitialized, isProfileModalOpen]);


  const handleSaveProfile = (data: UserProfile) => {
    setUserProfile(data);
    setDailyGoalCalories(calculateBMR(data)); 
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
  
  const clearCurrentMeal = useCallback(() => {
    setCurrentMealData(null);
    setProcessingError(null);
  }, []);

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
    setCurrentMealData(null); 
  };

  const [consumedToday, setConsumedToday] = useState(0);
  const [proteinToday, setProteinToday] = useState(0);
  const [fatToday, setFatToday] = useState(0);
  const [carbsToday, setCarbsToday] = useState(0);

  useEffect(() => {
    if (clientReady && isHistoryInitialized) { 
      const todayEntries = history.filter(entry => isToday(parseISO(entry.date)));
      setConsumedToday(todayEntries.reduce((sum, entry) => sum + entry.totalCalories, 0));
      setProteinToday(todayEntries.reduce((sum, entry) => sum + entry.totalProtein, 0));
      setFatToday(todayEntries.reduce((sum, entry) => sum + entry.totalFat, 0));
      setCarbsToday(todayEntries.reduce((sum, entry) => sum + entry.totalCarbohydrates, 0));
    }
  }, [history, isHistoryInitialized, clientReady]);

  const goalProtein = userProfile ? Math.round(userProfile.weightKg * 1.6) : 100; 
  const goalFat = userProfile ? Math.round((dailyGoalCalories * 0.25) / 9) : 50; 
  const goalCarbs = userProfile ? Math.round((dailyGoalCalories * 0.50) / 4) : 250; 

  if (!clientReady || !isHistoryInitialized || !isGoalInitialized || !isProfileInitialized || !isSetupCompleteInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading CalorieCam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-4 md:py-6 space-y-6 md:space-y-8">
        
        {(isSetupCompleteInitialized && isProfileInitialized) && (
          <UserProfileSetupModal 
            isOpen={isProfileModalOpen} 
            onSave={handleSaveProfile} 
          />
        )}

        {isGoalInitialized && isHistoryInitialized && (
          <section className="my-6 md:my-8">
            <CalorieProgressRing
              consumedCalories={consumedToday}
              goalCalories={dailyGoalCalories}
              size={200}
              strokeWidth={16}
              className="mx-auto shadow-lg"
            />
          </section>
        )}

        {/* Hero Section */}
        <section className="text-center py-8 md:py-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Smart Calorie Tracker</h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-xl mx-auto">
            Snap a photo, get insights, and track your nutrition effortlessly.
          </p>
        </section>

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

        {isHistoryInitialized && isGoalInitialized && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
              <TrendingUp className="mr-3 h-7 w-7 text-primary" /> Today's Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <SummaryCard
                title="Kcal"
                value={`~${consumedToday.toFixed(0)}`}
                goal={`/ ${dailyGoalCalories.toFixed(0)} kcal`}
                icon={<Flame className="h-7 w-7" />}
                color="text-orange-500" 
              />
              <SummaryCard
                title="Carbs"
                value={`~${carbsToday.toFixed(0)}g`}
                goal={`/ ${goalCarbs}g`}
                icon={<Leaf className="h-7 w-7" />}
                color="text-green-500"
              />
              <SummaryCard
                title="Protein"
                value={`~${proteinToday.toFixed(0)}g`}
                goal={`/ ${goalProtein}g`}
                icon={<Fish className="h-7 w-7" />} 
                color="text-red-500"
              />
              <SummaryCard
                title="Fat"
                value={`~${fatToday.toFixed(0)}g`}
                goal={`/ ${goalFat}g`}
                icon={<Utensils className="h-7 w-7" />} 
                color="text-yellow-600"
              />
            </div>
          </section>
        )}
        
        <FoodDisplay 
          mealData={currentMealData} 
          isLoading={isLoadingMeal && !currentMealData} 
          onLogMeal={handleLogMeal}
        />
        
        {isHistoryInitialized && (
          <CalorieHistory 
            history={history} 
            onClearEntry={(id) => {
              setHistory(prev => prev.filter(entry => entry.id !== id));
              toast({ title: "Entry Cleared", description: "The meal entry has been removed from your history."});
            }}
            onClearAllHistory={() => {
              setHistory([]);
              toast({ title: "History Cleared", description: "All meal entries have been removed."});
            }}
          />
        )}

        <Card className="shadow-lg rounded-xl overflow-hidden bg-card">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="flex items-center text-md font-semibold text-indigo-500">
              <Brain className="h-5 w-5 mr-2" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              You're doing great! Your average calorie intake this week is consistent.
              Consider adding more fiber from fruits.
            </p>
            <Button variant="link" className="p-0 h-auto text-sm text-primary mt-2">
              Learn More <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60 bg-card mt-auto">
        © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
      </footer>
    </div>
  );
}

