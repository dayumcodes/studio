"use client";

import type { ChangeEvent } from 'react';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, AlertCircle, UploadCloud } from 'lucide-react';
import { recognizeFood, type RecognizeFoodInput, type RecognizeFoodOutput } from '@/ai/flows/food-recognition';
import { calculateCalories, type CalculateCaloriesInput, type CalculateCaloriesOutput } from '@/ai/flows/calorie-calculation';
import type { FoodItem } from '@/lib/types';

interface FoodRecognitionFormProps {
  onMealDataProcessed: (data: FoodItem[]) => void;
  onProcessingError: (message: string) => void;
  clearCurrentMeal: () => void;
}

export function FoodRecognitionForm({ 
  onMealDataProcessed, 
  onProcessingError,
  clearCurrentMeal 
}: FoodRecognitionFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    clearCurrentMeal();
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !imagePreview) {
      setError("Please select an image first.");
      return;
    }

    setError(null);
    setIsRecognizing(true);
    setIsCalculating(false);
    onProcessingError(''); // Clear previous errors in parent

    try {
      const recognizeInput: RecognizeFoodInput = { photoDataUri: imagePreview };
      const recognitionResult: RecognizeFoodOutput = await recognizeFood(recognizeInput);
      
      setIsRecognizing(false);
      
      if (!recognitionResult.foodItems || recognitionResult.foodItems.length === 0) {
        setError("Could not recognize any food items. Try a clearer image or different angle.");
        onProcessingError("No food items recognized.");
        return;
      }

      setIsCalculating(true);
      const calculateInput: CalculateCaloriesInput = { 
        foodItems: recognitionResult.foodItems.map(name => ({ name })) 
      };
      const calorieResult: CalculateCaloriesOutput = await calculateCalories(calculateInput);
      
      onMealDataProcessed(calorieResult);

    } catch (err) {
      console.error("AI processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI processing.";
      setError(errorMessage);
      onProcessingError(errorMessage);
    } finally {
      setIsRecognizing(false);
      setIsCalculating(false);
    }
  };

  const isLoading = isRecognizing || isCalculating;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="h-7 w-7 text-primary" />
          Snap or Upload Food
        </CardTitle>
        <CardDescription>Upload an image of your meal to get calorie and nutrient information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Input
            id="food-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
          />
          <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP. Max 5MB.</p>
        </div>

        {imagePreview && (
          <div className="mt-4 border border-dashed border-border rounded-md p-2 bg-muted/30">
            <Image
              src={imagePreview}
              alt="Selected food preview"
              width={400}
              height={300}
              className="rounded-md object-contain max-h-[300px] w-full"
              data-ai-hint="food meal"
            />
          </div>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !imageFile}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Process food image"
        >
          {isRecognizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRecognizing && "Recognizing Food..."}
          {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCalculating && "Calculating Nutrients..."}
          {!isLoading && (
            <>
              <UploadCloud className="mr-2 h-5 w-5" />
              Get Nutritional Info
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
