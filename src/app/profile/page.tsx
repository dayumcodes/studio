
"use client";

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import useLocalStorage from '@/hooks/use-local-storage';
import type { UserProfile, CalorieLogEntry } from '@/lib/types';
import { USER_PROFILE_STORAGE_KEY, HISTORY_STORAGE_KEY } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { UserCircle, CalendarDays, Zap, Beef, Wheat, CookingPot, ListChecks, Utensils, Loader2 } from 'lucide-react';
import { genderLabels, activityLevelLabels } from '@/lib/types'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Button } from '@/components/ui/button';


interface GroupedHistoryEntry {
  date: Date;
  formattedDate: string;
  relativeDate?: string;
  entries: CalorieLogEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbohydrates: number;
}

interface ProfilePageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ProfilePage(props: ProfilePageProps) {
  // const searchParams = props.searchParams; // Access if needed

  const [clientReady, setClientReady] = useState(false);
  const [userProfile, setUserProfile, isProfileInitialized] = useLocalStorage<UserProfile | null>(USER_PROFILE_STORAGE_KEY, null);
  const [history, setHistory, isHistoryInitialized] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistoryEntry[]>([]);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!clientReady || !isHistoryInitialized) return;

    const groups: Record<string, GroupedHistoryEntry> = {};
    
    const sortedHistoryForGrouping = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedHistoryForGrouping.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const dateKey = format(entryDate, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        let relativeDate = '';
        if (isToday(entryDate)) relativeDate = 'Today';
        else if (isYesterday(entryDate)) relativeDate = 'Yesterday';

        groups[dateKey] = {
          date: entryDate,
          formattedDate: format(entryDate, 'MMMM d, yyyy'),
          relativeDate,
          entries: [],
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbohydrates: 0,
        };
      }
      groups[dateKey].entries.push(entry);
      groups[dateKey].totalCalories += entry.totalCalories;
      groups[dateKey].totalProtein += entry.totalProtein;
      groups[dateKey].totalFat += entry.totalFat;
      groups[dateKey].totalCarbohydrates += entry.totalCarbohydrates;
    });
    
    const sortedGroups = Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
    setGroupedHistory(sortedGroups);

  }, [history, isHistoryInitialized, clientReady]);


  if (!clientReady || !isProfileInitialized || !isHistoryInitialized) { 
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading Profile...</p>
        </div>
      </div>
    );
  }
  
  if (!userProfile) {
     return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
            <Alert variant="default" className="max-w-md text-center shadow-lg">
              <UserCircle className="h-5 w-5" />
              <AlertTitle>Profile Not Found</AlertTitle>
              <AlertDescription>
                Please set up your profile on the homepage to view this section.
              </AlertDescription>
               <Link href="/" className="mt-4 inline-block">
                  <Button variant="outline">Go to Homepage</Button>
              </Link>
            </Alert>
        </main>
         <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60 bg-card mt-auto">
          © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
        </footer>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* User Profile Card */}
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 p-5 md:p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <UserCircle size={40} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-semibold">My Profile</CardTitle>
                  <CardDescription className="text-sm md:text-base">Your personal health snapshot.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-sm">
              <div className="space-y-1 p-3 bg-background rounded-lg border border-border/70 shadow-sm">
                <p className="text-muted-foreground">Age</p>
                <p className="font-semibold text-lg">{userProfile.age} years</p>
              </div>
              <div className="space-y-1 p-3 bg-background rounded-lg border border-border/70 shadow-sm">
                <p className="text-muted-foreground">Gender</p>
                <p className="font-semibold text-lg capitalize">{genderLabels[userProfile.gender] || userProfile.gender.replace(/_/g, ' ')}</p>
              </div>
              <div className="space-y-1 p-3 bg-background rounded-lg border border-border/70 shadow-sm">
                <p className="text-muted-foreground">Weight</p>
                <p className="font-semibold text-lg">{userProfile.weightKg} kg</p>
              </div>
              <div className="space-y-1 p-3 bg-background rounded-lg border border-border/70 shadow-sm">
                <p className="text-muted-foreground">Height</p>
                <p className="font-semibold text-lg">{userProfile.heightCm} cm</p>
              </div>
              <div className="space-y-1 p-3 bg-background rounded-lg border border-border/70 shadow-sm col-span-1 sm:col-span-2 md:col-span-1">
                <p className="text-muted-foreground">Activity Level</p>
                <p className="font-semibold text-lg capitalize">{activityLevelLabels[userProfile.activityLevel] || userProfile.activityLevel.replace(/_/g, ' ')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Meal History Section */}
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 p-5 md:p-6 border-b">
                <div className="flex items-center gap-3">
                    <ListChecks className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-semibold">My Meal Journey</CardTitle>
                        <CardDescription className="text-sm md:text-base">A log of your tracked meals and daily summaries.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
              {!isHistoryInitialized || !clientReady ? ( // Should already be handled by page-level check, but good for robustness
                 <div className="py-10 px-5 text-center text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70 animate-pulse" />
                  <p className="font-medium">Loading Meal History...</p>
                </div>
              ) : groupedHistory.length === 0 ? (
                <div className="py-10 px-5 text-center text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70" />
                  <p className="font-medium">No meal history yet.</p>
                  <p className="text-sm">Start tracking your meals on the homepage!</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[70vh] flex-1 min-h-0"> 
                  <Accordion type="multiple" className="w-full">
                    {groupedHistory.map((group, index) => (
                      <AccordionItem value={`day-${index}`} key={`day-${index}`} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-5 md:px-6 py-4 hover:bg-muted/40 transition-colors w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                              <h3 className="text-base md:text-lg font-medium text-foreground">
                                {group.relativeDate && <span className="text-primary font-semibold">{group.relativeDate} - </span>}
                                {group.formattedDate}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {group.entries.length} meal{group.entries.length === 1 ? '' : 's'} logged
                              </p>
                            </div>
                            <div className="text-right space-x-2">
                               <Badge variant="secondary" className="py-1 px-2 text-xs bg-primary/10 text-primary border-primary/30">
                                <Zap size={12} className="mr-1" /> ~{group.totalCalories.toFixed(0)} Cal
                               </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 md:px-6 py-4 bg-muted/20">
                          <div className="space-y-4">
                            {group.entries.map(entry => (
                              <Card key={entry.id} className="bg-background shadow-sm overflow-hidden">
                                <CardHeader className="p-3 md:p-4 bg-background/50 border-b">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5">
                                      <CalendarDays size={14} className="text-accent" /> Logged at {format(parseISO(entry.date), 'h:mm a')}
                                    </p>
                                     <Badge variant="outline" className="text-xs py-0.5 px-1.5">
                                      <Zap size={12} className="mr-1" /> ~{entry.totalCalories.toFixed(0)} Cal
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 md:p-4 text-xs">
                                  <p className="font-medium text-foreground mb-1.5">Items ({entry.mealItems.length}):</p>
                                  <ul className="space-y-1 list-inside list-disc pl-1 marker:text-primary/70 max-h-40 overflow-y-auto pr-2">
                                    {entry.mealItems.map((item, itemIndex) => (
                                      <li key={itemIndex} className="capitalize text-muted-foreground">
                                        {item.name}
                                        {item.quantity ? ` (${item.quantity})` : ''}
                                        {' '} (~{item.nutrientInfo.calories.toFixed(0)} kcal)
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-border/50 text-muted-foreground">
                                    <p><Beef size={12} className="inline mr-0.5" /> P: ~{entry.totalProtein.toFixed(0)}g</p>
                                    <p><CookingPot size={12} className="inline mr-0.5" /> F: ~{entry.totalFat.toFixed(0)}g</p>
                                    <p><Wheat size={12} className="inline mr-0.5" /> C: ~{entry.totalCarbohydrates.toFixed(0)}g</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/60 bg-card mt-auto">
        © {new Date().getFullYear()} calorietracker.ai. Snap, Track, Thrive!
      </footer>
    </div>
  );
}
