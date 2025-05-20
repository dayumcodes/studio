
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CalorieLogEntry } from '@/lib/types';
import { History, Trash2, CalendarDays, Zap, Apple, BarChart3, ChefHat, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useState } from 'react';

interface CalorieHistoryProps {
  history: CalorieLogEntry[];
  onClearEntry: (id: string) => void;
  onClearAllHistory: () => void;
}

export function CalorieHistory({ history, onClearEntry, onClearAllHistory }: CalorieHistoryProps) {
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const toggleEntryExpansion = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  return (
    <Card className="w-full shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-4 md:px-6 bg-muted/30 border-b">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl font-semibold">
            <History className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            Meal Log
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Your journey of tracked meals (approx. values).</CardDescription>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" aria-label="Clear all history" className="flex-shrink-0 text-xs px-2.5 py-1.5 h-auto md:px-3 md:py-2">
                <Trash2 className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" /> Clear All
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
      <CardContent className="p-0">
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center m-4 md:m-6 border border-dashed border-border rounded-lg bg-muted/40">
            <BarChart3 className="h-16 w-16 text-muted-foreground/70 mb-4" />
            <p className="text-lg font-medium text-foreground">Your Log is Empty</p>
            <p className="text-muted-foreground max-w-xs text-sm">
              Start by snapping a photo of your meal. Your logged entries will appear here!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-24rem)] md:h-[30rem] lg:h-[calc(100vh-28rem)]"> 
            <div className="space-y-0">
              {sortedHistory.map((entry) => (
                <Card key={entry.id} className="bg-card rounded-none border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-150 ease-in-out">
                  <div 
                    className="p-4 md:p-5 cursor-pointer"
                    onClick={() => toggleEntryExpansion(entry.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleEntryExpansion(entry.id)}
                    aria-expanded={expandedEntryId === entry.id}
                    aria-controls={`entry-details-${entry.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground mb-1">
                           <CalendarDays size={16} className="text-accent flex-shrink-0"/> 
                           {format(new Date(entry.date), "MMM d, yyyy - h:mm a")}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Badge variant="secondary" className="py-1 px-2.5 text-sm bg-primary/10 text-primary border-primary/30">
                            <Zap size={14} className="mr-1.5" /> ~{entry.totalCalories.toFixed(0)} Calories
                          </Badge>
                           <span className="text-xs text-muted-foreground flex items-center gap-1">
                             <ChefHat size={14} /> 
                             {entry.mealItems.length} item{entry.mealItems.length === 1 ? '' : 's'}
                           </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {expandedEntryId === entry.id ? <ChevronUp size={20} className="text-muted-foreground"/> : <ChevronDown size={20} className="text-muted-foreground"/>}
                        <AlertDialog onOpenChange={(open) => { if(open) { /* Prevents card click from toggling while dialog open */ setExpandedEntryId(entry.id); } }}>
                          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                             <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0">
                               <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Delete entry</span>
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
                      </div>
                    </div>
                  </div>
                  {expandedEntryId === entry.id && (
                    <div id={`entry-details-${entry.id}`} className="px-4 md:px-5 pb-4 pt-2 border-t border-border/50 bg-muted/20 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                      <h4 className="text-sm font-medium text-foreground mb-2">Meal Items:</h4>
                      <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-2 text-xs">
                        {entry.mealItems.map((item, index) => (
                          <li key={index} className="capitalize flex justify-between items-center p-2 rounded-md bg-background/70 shadow-sm">
                            <span className="flex items-center gap-1.5">
                              <Apple size={14} className="text-primary/80"/>
                              {item.name}
                            </span>
                            <Badge variant="outline" className="text-xs">~{item.nutrientInfo.calories.toFixed(0)} kcal</Badge>
                          </li>
                        ))}
                      </ul>
                      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-muted-foreground border-t border-border/70">
                        <p>Protein: <span className="font-semibold text-foreground/80">~{entry.totalProtein.toFixed(0)}g</span></p>
                        <p>Fat: <span className="font-semibold text-foreground/80">~{entry.totalFat.toFixed(0)}g</span></p>
                        <p>Carbs: <span className="font-semibold text-foreground/80">~{entry.totalCarbohydrates.toFixed(0)}g</span></p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
