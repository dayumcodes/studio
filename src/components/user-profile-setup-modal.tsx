
"use client";

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { UserProfile, Gender, ActivityLevel } from "@/lib/types";
import { GENDERS, ACTIVITY_LEVELS } from "@/lib/types";
import { UserCircle } from 'lucide-react';

const profileFormSchema = z.object({
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }).min(1, "Age is required."),
  gender: z.enum(GENDERS, { required_error: "Gender is required." }),
  weightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }).min(1, "Weight is required."),
  heightCm: z.coerce.number().int().positive({ message: "Height must be a positive number." }).min(1, "Height is required."),
  activityLevel: z.enum(ACTIVITY_LEVELS, { required_error: "Activity level is required." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileSetupModalProps {
  isOpen: boolean;
  onSave: (data: UserProfile) => void;
  // No onClose, modal is persistent until saved
}

const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  lightly_active: "Lightly active (light exercise 1-3 days/wk)",
  moderately_active: "Moderately active (moderate exercise 3-5 days/wk)",
  very_active: "Very active (hard exercise 6-7 days/wk)",
};

const genderLabels: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};

export function UserProfileSetupModal({ isOpen, onSave }: UserProfileSetupModalProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weightKg: undefined,
      heightCm: undefined,
      activityLevel: undefined,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    onSave(data as UserProfile); // Type assertion is safe due to schema match
  };

  // Prevent closing the dialog via Escape key or overlay click
  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      // Dialog is trying to close, but we only allow closing via onSave
      // So, we do nothing here to prevent it.
      return;
    }
    // This handles Dialog's own state if it were controlled internally,
    // but since isOpen is a prop, we rely on the parent.
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="h-7 w-7 text-primary" />
            <DialogTitle className="text-2xl">Welcome to calorietracker.ai!</DialogTitle>
          </div>
          <DialogDescription>
            Let's get some basic information to personalize your experience. This will help us tailor recommendations for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Your age" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input type="number" placeholder="e.g., 70" {...field} step="0.1" />
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
                      <Input type="number" placeholder="e.g., 175" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Profile & Continue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
