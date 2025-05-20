
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Target, PlusCircle, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalorieGoalAdjusterProps {
  consumedCalories: number;
  currentGoalCalories: number;
  onNewGoalSet: (newGoal: number) => void;
  onDismiss?: () => void; // Optional: if the component can be dismissed
  isVisible: boolean; // To control visibility, parent manages this
}

export function CalorieGoalAdjuster({
  consumedCalories,
  currentGoalCalories,
  onNewGoalSet,
  onDismiss,
  isVisible,
}: CalorieGoalAdjusterProps) {
  const [newGoal, setNewGoal] = useState<string>(currentGoalCalories.toString());

  useEffect(() => {
    // Update the input field if the currentGoalCalories prop changes or when the component becomes visible
    setNewGoal(currentGoalCalories.toString());
  }, [currentGoalCalories, isVisible]);

  if (!isVisible) {
    return null;
  }

  const deficit = Math.max(0, currentGoalCalories - consumedCalories);
  const isInDeficit = consumedCalories < currentGoalCalories && deficit > 0; // Only consider a deficit if remaining is > 0

  // If not in a deficit (e.g. met or exceeded goal), don't show this adjuster.
  // The parent component should ideally handle this logic with `isVisible`, 
  // but this is an additional safeguard within the component.
  if (!isInDeficit) {
      return null;
  }

  const handleSetGoal = () => {
    const goalValue = parseInt(newGoal, 10);
    if (!isNaN(goalValue) && goalValue >= 0) {
      onNewGoalSet(goalValue);
    } else {
      // Consider adding a toast notification for invalid input
      console.error("Invalid goal value entered.");
    }
  };

  const handlePresetClick = (amountToAdd?: number, matchIntake?: boolean) => {
    if (matchIntake) {
      setNewGoal(Math.max(0, consumedCalories).toString()); // Ensure goal is not negative
    } else if (amountToAdd !== undefined) {
      const currentInputVal = parseInt(newGoal, 10);
      // If newGoal is not a valid number, base it on consumedCalories or currentGoal, whichever makes more sense
      const baseValue = isNaN(currentInputVal) ? Math.max(consumedCalories, currentGoalCalories) : currentInputVal;
      setNewGoal(Math.max(0, baseValue + amountToAdd).toString());
    }
  };

  return (
    <Card className={cn(
        "w-full max-w-md mx-auto shadow-lg rounded-xl",
        "border-orange-400/60 bg-orange-50/70 dark:border-orange-600/50 dark:bg-orange-900/20"
      )}
    >
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10 h-8 w-8"
          onClick={onDismiss}
          aria-label="Dismiss goal adjuster"
        >
          <X size={18} />
        </Button>
      )}
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-full">
            <AlertTriangle className="h-6 w-6 text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              Calorie Deficit Alert
            </CardTitle>
            <CardDescription className="text-xs text-orange-600 dark:text-orange-400/80">
              You're currently under your daily goal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2 pb-5">
        <Alert variant="default" className="bg-background/70 border-border shadow-sm">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-sm font-medium text-foreground">
            Current Status
          </AlertTitle>
          <AlertDescription className="text-xs space-y-0.5 mt-1 text-muted-foreground">
            <p>Consumed: <span className="font-semibold text-foreground">{consumedCalories.toFixed(0)}</span> kcal</p>
            <p>Goal: <span className="font-semibold text-foreground">{currentGoalCalories.toFixed(0)}</span> kcal</p>
            <p>Deficit: <strong className="text-orange-600 dark:text-orange-400">{deficit.toFixed(0)} kcal</strong></p>
          </AlertDescription>
        </Alert>

        <Separator className="my-3 bg-orange-200 dark:bg-orange-700/50" />

        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Need more energy today? You can adjust your calorie goal.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="new-calorie-goal" className="text-xs font-medium text-muted-foreground">
              Set New Daily Goal (kcal)
            </Label>
            <Input
              id="new-calorie-goal"
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., 2200"
              min="0"
              className="text-base h-11 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Quick Adjustments</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              onClick={() => handlePresetClick(100)}
            >
              <PlusCircle size={14} className="mr-1" /> +100
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              onClick={() => handlePresetClick(250)}
            >
              <PlusCircle size={14} className="mr-1" /> +250
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              onClick={() => handlePresetClick(undefined, true)}
            >
              Match Intake
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-5">
        <Button 
            onClick={handleSetGoal} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold"
            disabled={parseInt(newGoal, 10) === currentGoalCalories || isNaN(parseInt(newGoal, 10))}
        >
          <Target size={16} className="mr-2" /> Set New Goal
        </Button>
      </CardFooter>
    </Card>
  );
}

