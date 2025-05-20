
import type { CalculateCaloriesOutput as MealItemNutrients } from '@/ai/flows/calorie-calculation';

// This represents a single food item with its nutrient information after AI processing.
// It's an element from the array returned by calculateCalories.
export type FoodItem = MealItemNutrients extends (infer U)[] ? U : never;

export interface CalorieLogEntry {
  id: string;
  date: string; // ISO string format for date
  mealItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbohydrates: number;
}

export const GENDERS = ["male", "female", "prefer_not_to_say"] as const;
export type Gender = typeof GENDERS[number];

export const ACTIVITY_LEVELS = [
  "sedentary", // little or no exercise
  "lightly_active", // light exercise/sports 1-3 days/week
  "moderately_active", // moderate exercise/sports 3-5 days/week
  "very_active", // hard exercise/sports 6-7 days a week
] as const;
export type ActivityLevel = typeof ACTIVITY_LEVELS[number];

export interface UserProfile {
  age: number;
  gender: Gender;
  weightKg: number; // Weight in kilograms
  heightCm: number; // Height in centimeters
  activityLevel: ActivityLevel;
}

// Labels for UI display
export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little/no exercise)",
  lightly_active: "Lightly active (1-3 days/wk)",
  moderately_active: "Moderately active (3-5 days/wk)",
  very_active: "Very active (6-7 days/wk)",
};

export const genderLabels: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};
