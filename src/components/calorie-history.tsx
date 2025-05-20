
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CalorieLogEntry } from '@/lib/types';
import { History, Trash2, CalendarDays, Zap, Apple, Info, BarChart3, ChefHat } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CalorieHistoryProps {
  history: CalorieLogEntry[];
  onClearEntry: (id: string) => void;
  onClearAllHistory: () => void;
}

export function CalorieHistory({ history, onClearEntry, onClearAllHistory }: CalorieHistoryProps) {
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/30">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <History className="h-8 w-8 text-primary" />
            Meal Log
          </CardTitle>
          <CardDescription>Your journey of tracked meals (values are approximate).</CardDescription>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" aria-label="Clear all history" className="flex-shrink-0">
                <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your logged meal history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAllHistory} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg bg-muted/20 m-6 border border-dashed border-border">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">Your Log is Empty</p>
            <p className="text-muted-foreground max-w-xs">
              Start by snapping a photo of your meal. Your logged entries will appear here!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)] md:h-[450px] lg:h-[calc(100vh-26rem)] pr-3 md:pr-4"> {/* Adjusted height */}
            <div className="space-y-4 p-1 md:p-0">
              {sortedHistory.map((entry) => (
                <Card key={entry.id} className="bg-card hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-4 flex flex-row justify-between items-start bg-muted/10">
                    <div>
                      <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2 text-foreground/90">
                         <CalendarDays size={18} className="text-accent flex-shrink-0"/> 
                         {format(new Date(entry.date), "MMM d, yyyy - h:mm a")}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        <Zap size={14} className="mr-1 text-primary" /> ~{entry.totalCalories.toFixed(0)} Calories
                      </Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0">
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete entry from {format(new Date(entry.date), "MMM d, yyyy")}</span>
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this meal entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this meal logged on {format(new Date(entry.date), "MMM d, h:mm a")}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onClearEntry(entry.id)} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-accent hover:underline list-none -ml-1 py-1">
                        <div className="flex items-center gap-2">
                         <ChefHat size={16} /> 
                         <span className="font-medium">
                           {entry.mealItems.length} item{entry.mealItems.length === 1 ? '' : 's'} recognized
                         </span>
                        </div>
                         <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
                           (Show details)
                         </span>
                      </summary>
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        <ul className="space-y-1 max-h-32 overflow-y-auto pr-2">
                          {entry.mealItems.map((item, index) => (
                            <li key={index} className="capitalize truncate flex justify-between items-center text-xs p-1.5 rounded-md hover:bg-muted/50">
                              <span className="flex items-center gap-1.5">
                                <Apple size={14} className="text-primary/70"/>
                                {item.name}
                              </span>
                              <Badge variant="outline">~{item.nutrientInfo.calories.toFixed(0)} kcal</Badge>
                            </li>
                          ))}
                        </ul>
                        <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground border-t border-border/50">
                          <p>Protein: <span className="font-semibold text-foreground/80">~{entry.totalProtein.toFixed(0)}g</span></p>
                          <p>Fat: <span className="font-semibold text-foreground/80">~{entry.totalFat.toFixed(0)}g</span></p>
                          <p>Carbs: <span className="font-semibold text-foreground/80">~{entry.totalCarbohydrates.toFixed(0)}g</span></p>
                        </div>
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
