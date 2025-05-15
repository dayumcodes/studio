'use server';
/**
 * @fileOverview Calorie and nutrient calculation flow for identified food items.
 *
 * - calculateCalories - A function that calculates the calorie and nutrient information of food items.
 * - CalculateCaloriesInput - The input type for the calculateCalories function.
 * - CalculateCaloriesOutput - The return type for the calculateCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodItemSchema = z.object({
  name: z.string().describe('The name of the food item.'),
  quantity: z.string().optional().describe('The quantity of the food item, e.g., 1 apple, 2 slices.'),
});

const CalculateCaloriesInputSchema = z.object({
  foodItems: z.array(FoodItemSchema).describe('A list of identified food items.'),
});
export type CalculateCaloriesInput = z.infer<typeof CalculateCaloriesInputSchema>;

const NutrientInfoSchema = z.object({
  calories: z.number().describe('The number of calories in the food item. This field is required and must be a number.'),
  protein: z.number().describe('The amount of protein in grams. This field is required and must be a number.'),
  fat: z.number().describe('The amount of fat in grams. This field is required and must be a number.'),
  carbohydrates: z.number().describe('The amount of carbohydrates in grams. This field is required and must be a number.'),
});

const CalorieCalculationResultSchema = z.object({
  name: z.string().describe('The name of the food item.'),
  nutrientInfo: NutrientInfoSchema.describe('Nutrient information for the food item.'),
});

const CalculateCaloriesOutputSchema = z.array(CalorieCalculationResultSchema);
export type CalculateCaloriesOutput = z.infer<typeof CalculateCaloriesOutputSchema>;

export async function calculateCalories(input: CalculateCaloriesInput): Promise<CalculateCaloriesOutput> {
  return calculateCaloriesFlow(input);
}

const getFoodNutrients = ai.defineTool(
  {
    name: 'getFoodNutrients',
    description: 'Returns the calorie and nutrient information for a given food item.',
    inputSchema: FoodItemSchema,
    outputSchema: NutrientInfoSchema,
  },
  async (input) => {
    // This is a placeholder implementation.  In a real application, this would
    // call an external API or database to retrieve the nutrient information.
    // For now, it returns a fixed set of values.
    console.log(`Looking up nutrients for ${input.name} ${input.quantity ?? ''}`);
    return {
      calories: 100,
      protein: 5,
      fat: 2,
      carbohydrates: 15,
    };
  }
);

const calculateCaloriesPrompt = ai.definePrompt({
  name: 'calculateCaloriesPrompt',
  tools: [getFoodNutrients],
  input: {schema: CalculateCaloriesInputSchema},
  output: {schema: CalculateCaloriesOutputSchema},
  prompt: `For each food item in the input list, use the getFoodNutrients tool to find its calorie and nutrient information. Return a list of objects, where each object contains the food item name and its nutrient information. Ensure all fields in nutrientInfo (calories, protein, fat, carbohydrates) are populated with numbers.

Food items:
{{#each foodItems}}
- Name: {{this.name}}, Quantity: {{this.quantity}}
{{/each}}`,
});

const calculateCaloriesFlow = ai.defineFlow(
  {
    name: 'calculateCaloriesFlow',
    inputSchema: CalculateCaloriesInputSchema,
    outputSchema: CalculateCaloriesOutputSchema,
  },
  async input => {
    const {output} = await calculateCaloriesPrompt(input);
    return output!;
  }
);

