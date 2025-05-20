
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import useLocalStorage from '@/hooks/use-local-storage';
import type { UserProfile, CalorieLogEntry, FoodItem } from '@/lib/types';
import { USER_PROFILE_STORAGE_KEY, HISTORY_STORAGE_KEY } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { UserCircle, Apple, CalendarDays, Zap, Beef, Wheat, CookingPot, ListChecks, Utensils } from 'lucide-react';
import { GENDERS, ACTIVITY_LEVELS, genderLabels, activityLevelLabels } from '@/lib/types'; // Ensure these are exported from types.ts
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

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(USER_PROFILE_STORAGE_KEY, null);
  const [history, setHistory] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistoryEntry[]>([]);

  useEffect(() => {
    const groups: Record<string, GroupedHistoryEntry> = {};
    
    // Sort history by date descending before grouping to ensure meals within a day are ordered if needed
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
    
    // Sort groups by date descending
    const sortedGroups = Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
    setGroupedHistory(sortedGroups);

  }, [history]);


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
                  {/* Placeholder for future avatar image */}
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
            <CardContent className="p-0">
              {groupedHistory.length === 0 ? (
                <div className="py-10 px-5 text-center text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70" />
                  <p className="font-medium">No meal history yet.</p>
                  <p className="text-sm">Start tracking your meals on the homepage!</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[70vh]">
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
                                  <ul className="space-y-1 list-inside list-disc pl-1 marker:text-primary/70">
                                    {entry.mealItems.map((item, itemIndex) => (
                                      <li key={itemIndex} className="capitalize text-muted-foreground">
                                        {item.name} (~{item.nutrientInfo.calories.toFixed(0)} kcal)
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

// Helper constants for local storage keys, can be moved to a constants file
// export const USER_PROFILE_STORAGE_KEY = 'calorieCamUserProfile'; // Already exists on page.tsx, should centralize
// export const HISTORY_STORAGE_KEY = 'calorieCamHistory'; // Already exists on page.tsx, should centralize
// For now, I'll define them here if not already available from types.ts - better to create a dedicated constants.ts
const PROFILE_SETUP_COMPLETE_KEY = 'calorieCamProfileSetupComplete';
// Define GENDERS and ACTIVITY_LEVELS if not available (they should be in types.ts)
// export const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
// export const ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"] as const;

// export const activityLevelLabels: Record<ActivityLevel, string> = {
//   sedentary: "Sedentary (little or no exercise)",
//   lightly_active: "Lightly active (light exercise 1-3 days/wk)",
//   moderately_active: "Moderately active (moderate exercise 3-5 days/wk)",
//   very_active: "Very active (hard exercise 6-7 days/wk)",
//   extra_active: "Extra active (very hard exercise & physical job)",
// };

// export const genderLabels: Record<Gender, string> = {
//   male: "Male",
//   female: "Female",
//   other: "Other",
//   prefer_not_to_say: "Prefer not to say",
// };
