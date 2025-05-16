'use server';
/**
 * @fileOverview Food recognition AI agent.
 *
 * - recognizeFood - A function that handles the food recognition process.
 * - RecognizeFoodInput - The input type for the recognizeFood function.
 * - RecognizeFoodOutput - The return type for the recognizeFood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeFoodInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeFoodInput = z.infer<typeof RecognizeFoodInputSchema>;

const RecognizeFoodOutputSchema = z.object({
  isFood: z.boolean().describe('Whether or not the input image contains food.'),
  foodItems: z
    .array(z.string())
    .describe('A list of food items identified in the photo. Should be empty if isFood is false.'),
});
export type RecognizeFoodOutput = z.infer<typeof RecognizeFoodOutputSchema>;

export async function recognizeFood(input: RecognizeFoodInput): Promise<RecognizeFoodOutput> {
  return recognizeFoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeFoodPrompt',
  input: {schema: RecognizeFoodInputSchema},
  output: {schema: RecognizeFoodOutputSchema},
  prompt: `You are an expert food identifier.

You will use this information to identify the food items in the photo.
First, determine if the image actually contains food. Set the 'isFood' field to true if it does, and false otherwise.
If 'isFood' is true, list the food items that you see in the photo. Enclose the list in brackets.
If 'isFood' is false, the 'foodItems' list must be empty.

Photo: {{media url=photoDataUri}}`,
});

const recognizeFoodFlow = ai.defineFlow(
  {
    name: 'recognizeFoodFlow',
    inputSchema: RecognizeFoodInputSchema,
    outputSchema: RecognizeFoodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
