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
