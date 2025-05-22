
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import useLocalStorage from '@/hooks/use-local-storage';
import type { UserProfile, CalorieLogEntry, Gender, ActivityLevel } from '@/lib/types';
import { USER_PROFILE_STORAGE_KEY, HISTORY_STORAGE_KEY, GOAL_STORAGE_KEY, DEFAULT_DAILY_GOAL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { UserCircle, CalendarDays, Zap, Beef, Wheat, CookingPot, ListChecks, Utensils, Loader2, Pencil, Save, Ban } from 'lucide-react';
import { genderLabels, activityLevelLabels, GENDERS, ACTIVITY_LEVELS } from '@/lib/types'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { calculateBMR } from '@/lib/health-utils';
import { cn } from '@/lib/utils';


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

const profileFormSchema = z.object({
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }).min(1, "Age is required."),
  gender: z.enum(GENDERS, { required_error: "Gender is required." }),
  weightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }).min(1, "Weight is required."),
  heightCm: z.coerce.number().int().positive({ message: "Height must be a positive number." }).min(1, "Height is required."),
  activityLevel: z.enum(ACTIVITY_LEVELS, { required_error: "Activity level is required." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function ProfilePage(props: ProfilePageProps) {
  const [clientReady, setClientReady] = useState(false);
  const [userProfile, setUserProfile, isProfileInitialized] = useLocalStorage<UserProfile | null>(USER_PROFILE_STORAGE_KEY, null);
  const [history, setHistory, isHistoryInitialized] = useLocalStorage<CalorieLogEntry[]>(HISTORY_STORAGE_KEY, []);
  const [_dailyGoalCalories, setDailyGoalCalories, isGoalInitialized] = useLocalStorage<number>(GOAL_STORAGE_KEY, DEFAULT_DAILY_GOAL);
  
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistoryEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfile || {
      age: 0, // zod coerce will handle initial undefined for number conversion
      gender: undefined,
      weightKg: 0,
      heightCm: 0,
      activityLevel: undefined,
    },
  });

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (isEditing && userProfile) {
      form.reset({
        age: userProfile.age,
        gender: userProfile.gender,
        weightKg: userProfile.weightKg,
        heightCm: userProfile.heightCm,
        activityLevel: userProfile.activityLevel,
      });
    }
  }, [isEditing, userProfile, form]);


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

  const onSubmit = (data: ProfileFormValues) => {
    const updatedProfile = data as UserProfile;
    setUserProfile(updatedProfile);
    setDailyGoalCalories(calculateBMR(updatedProfile));
    setIsEditing(false);
    toast({
      title: "Profile Updated!",
      description: "Your information has been successfully saved.",
      variant: "default",
    });
  };

  if (!clientReady || !isProfileInitialized || !isHistoryInitialized || !isGoalInitialized) { 
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading Profile...</p>
        </div>
      </div>
    );
  }
  
  if (!userProfile && clientReady) { // Ensure clientReady before showing this
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
            <CardHeader className="bg-muted/30 p-5 md:p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <UserCircle size={40} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-semibold">
                    {isEditing ? "Edit Profile" : "My Profile"}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {isEditing ? "Update your personal details below." : "Your personal health snapshot."}
                  </CardDescription>
                </div>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)} aria-label="Edit profile">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsEditing(false)} aria-label="Cancel editing">
                  <Ban className="mr-2 h-4 w-4" /> Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-5 md:p-6">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Your age" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GENDERS.map((gender) => (
                                  <SelectItem key={gender} value={gender}>
                                    {genderLabels[gender]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weightKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 70" {...field} step="0.1" value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="heightCm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ACTIVITY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {activityLevelLabels[level]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <CardFooter className="p-0 pt-4">
                      <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={form.formState.isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-sm">
                  {userProfile && (
                    <>
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
                    </>
                  )}
                </div>
              )}
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
             <CardContent className={cn("p-0 flex flex-col", { "min-h-[200px]": groupedHistory.length > 0 })}>
              {!isHistoryInitialized || !clientReady ? (
                 <div className="py-10 px-5 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70 animate-pulse" />
                  <p className="font-medium">Loading Meal History...</p>
                </div>
              ) : groupedHistory.length === 0 ? (
                <div className="py-10 px-5 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <Utensils className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70" />
                  <p className="font-medium">No meal history yet.</p>
                  <p className="text-sm">Start tracking your meals on the homepage!</p>
                </div>
              ) : (
                <ScrollArea className="flex-1" style={{maxHeight: '70vh', minHeight: '200px'}}> 
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
