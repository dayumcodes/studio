"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CalorieLogEntry } from '@/lib/types';
import { History, Trash2, CalendarDays, Zap, Info } from 'lucide-react';
import { format } from 'date-fns';

interface CalorieHistoryProps {
  history: CalorieLogEntry[];
  onClearEntry: (id: string) => void;
  onClearAllHistory: () => void;
}

export function CalorieHistory({ history, onClearEntry, onClearAllHistory }: CalorieHistoryProps) {
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <History className="h-7 w-7 text-primary" />
            Calorie Log
          </CardTitle>
          <CardDescription>Your logged meals and calorie intake over time.</CardDescription>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAllHistory} aria-label="Clear all history">
            <Trash2 className="mr-1 h-4 w-4" /> Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No meals logged yet. Start tracking to see your history here!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {sortedHistory.map((entry) => (
                <Card key={entry.id} className="bg-muted/30 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                           <CalendarDays size={18} className="text-accent"/> 
                           {format(new Date(entry.date), "MMM d, yyyy - h:mm a")}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-primary font-semibold">
                          <Zap size={16} /> {entry.totalCalories.toFixed(0)} Calories
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onClearEntry(entry.id)} aria-label={`Delete entry from ${format(new Date(entry.date), "MMM d, yyyy")}`}>
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-1">Items:</p>
                    <ul className="list-disc list-inside text-sm space-y-0.5 max-h-20 overflow-y-auto">
                      {entry.mealItems.map((item, index) => (
                        <li key={index} className="capitalize truncate">
                          {item.name} - {item.nutrientInfo.calories.toFixed(0)} kcal
                        </li>
                      ))}
                    </ul>
                    <details className="text-xs mt-2">
                      <summary className="cursor-pointer text-accent hover:underline">Nutrient Totals</summary>
                      <div className="grid grid-cols-3 gap-2 mt-1 pt-1 border-t border-border/50">
                        <p>Protein: {entry.totalProtein.toFixed(1)}g</p>
                        <p>Fat: {entry.totalFat.toFixed(1)}g</p>
                        <p>Carbs: {entry.totalCarbohydrates.toFixed(1)}g</p>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
