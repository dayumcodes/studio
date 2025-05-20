
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Target, PlusCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalorieGoalAdjusterProps {
  consumedCalories: number;
  currentGoalCalories: number;
  onNewGoalSet: (newGoal: number) => void;
}

export function CalorieGoalAdjuster({
  consumedCalories,
  currentGoalCalories,
  onNewGoalSet,
}: CalorieGoalAdjusterProps) {
  const [newGoal, setNewGoal] = useState<string>(currentGoalCalories.toString());

  useEffect(() => {
    setNewGoal(currentGoalCalories.toString());
  }, [currentGoalCalories]);

  const deficit = Math.max(0, currentGoalCalories - consumedCalories);
  const isInDeficit = consumedCalories < currentGoalCalories && deficit > 0;

  const handleSetGoal = () => {
    const goalValue = parseInt(newGoal, 10);
    if (!isNaN(goalValue) && goalValue >= 0) {
      onNewGoalSet(goalValue);
    } else {
      // Potentially add a toast error here
      console.error("Invalid goal value entered.");
    }
  };

  const handlePresetClick = (amountToAdd?: number, matchIntake?: boolean) => {
    if (matchIntake) {
      setNewGoal(Math.max(0, consumedCalories).toString());
    } else if (amountToAdd !== undefined) {
      const currentInputVal = parseInt(newGoal, 10);
      const baseValue = isNaN(currentInputVal) ? Math.max(consumedCalories, currentGoalCalories) : currentInputVal;
      setNewGoal(Math.max(0, baseValue + amountToAdd).toString());
    }
  };

  return (
    <Card className={cn(
        "w-full max-w-md mx-auto shadow-lg rounded-xl", // Kept rounded-xl
        isInDeficit 
          ? "border-chart-3/60 bg-orange-50/70 dark:border-chart-3/50 dark:bg-orange-900/20" // Use chart-3 for orange
          : "border-border bg-card"
      )}
    >
      <CardHeader className="pb-3 pt-5 px-4 md:px-5">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "p-2.5 rounded-full", // Slightly larger padding for icon
            isInDeficit 
              ? "bg-chart-3/10 dark:bg-chart-3/20" 
              : "bg-primary/10 dark:bg-primary/20"
          )}>
            {isInDeficit ? (
              <AlertTriangle className="h-6 w-6 text-chart-3 dark:text-chart-3" />
            ) : (
              <Target className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className={cn(
              "text-lg font-semibold",
              isInDeficit 
                ? "text-orange-700 dark:text-orange-300" // Keeping specific orange for text for now
                : "text-foreground"
            )}>
              {isInDeficit ? "Calorie Deficit" : "Adjust Daily Goal"}
            </CardTitle>
            <CardDescription className={cn(
              "text-xs",
              isInDeficit 
                ? "text-orange-600 dark:text-orange-400/80" 
                : "text-muted-foreground"
            )}>
              {isInDeficit ? `You're ~${deficit.toFixed(0)} kcal under your goal.` : "Manage your daily calorie target."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2 pb-5 px-4 md:px-5">
        {isInDeficit && (
          <Alert variant="default" className="bg-background/70 border-border shadow-sm rounded-md">
            <TrendingDown className="h-4 w-4 text-chart-3" />
            <AlertTitle className="text-sm font-medium text-foreground">
              Current Status
            </AlertTitle>
            <AlertDescription className="text-xs space-y-0.5 mt-1 text-muted-foreground">
              <p>Consumed: <span className="font-semibold text-foreground">~{consumedCalories.toFixed(0)}</span> kcal</p>
              <p>Goal: <span className="font-semibold text-foreground">{currentGoalCalories.toFixed(0)}</span> kcal</p>
              <p>Deficit: <strong className="text-chart-3 dark:text-chart-3">~{deficit.toFixed(0)} kcal</strong></p>
            </AlertDescription>
          </Alert>
        )}
        
        {isInDeficit && <Separator className="my-3 bg-chart-3/20 dark:bg-chart-3/50" />}

        <div className="space-y-3">
          {!isInDeficit && (
             <p className="text-sm text-muted-foreground">
              Consumed: <span className="font-semibold text-foreground">~{consumedCalories.toFixed(0)}</span> kcal / <span className="font-semibold text-foreground">{currentGoalCalories.toFixed(0)}</span> kcal goal.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="new-calorie-goal" className="text-xs font-medium text-muted-foreground">
              {isInDeficit ? "Set New Target (kcal)" : "New Daily Goal (kcal)"}
            </Label>
            <Input
              id="new-calorie-goal"
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., 2200"
              min="0"
              className="text-base h-11 focus:border-primary rounded-md"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Quick Adjustments</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary rounded-md"
              onClick={() => handlePresetClick(100)}
            >
              <PlusCircle size={14} className="mr-1" /> +100
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary rounded-md"
              onClick={() => handlePresetClick(250)}
            >
              <PlusCircle size={14} className="mr-1" /> +250
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary rounded-md"
              onClick={() => handlePresetClick(undefined, true)}
              disabled={consumedCalories === 0} 
            >
              Match Intake
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-5 px-4 md:px-5">
        <Button 
            onClick={handleSetGoal} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold rounded-md"
            disabled={parseInt(newGoal, 10) === currentGoalCalories || isNaN(parseInt(newGoal, 10)) || parseInt(newGoal, 10) < 0}
        >
          <Target size={16} className="mr-2" /> Set New Goal
        </Button>
      </CardFooter>
    </Card>
  );
}
