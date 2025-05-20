
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FoodItem } from '@/lib/types';
import { Zap, Beef, Fish, Drumstick, Wheat, Salad, Info, StickyNote, TrendingUp, Percent, Weight } from 'lucide-react'; // Added more icons
import { Badge } from '@/components/ui/badge';

interface FoodDisplayProps {
  mealData: FoodItem[] | null;
  isLoading: boolean;
  onLogMeal: (mealData: FoodItem[], totals: { calories: number; protein: number; fat: number; carbs: number }) => void;
}

const NutrientIcon = ({ nutrient }: { nutrient: keyof FoodItem['nutrientInfo'] | 'name' | 'carbs' }) => {
  switch(nutrient) {
    case 'calories': return <Zap className="h-4 w-4 text-orange-500" />;
    case 'protein': return <Beef className="h-4 w-4 text-red-500" />; // Or Drumstick
    case 'fat': return <Percent className="h-4 w-4 text-yellow-500" />; // Or Fish (representing omega oils)
    case 'carbs': // Fallthrough for carbohydrates
    case 'carbohydrates': return <Wheat className="h-4 w-4 text-amber-600" />;
    default: return <Salad className="h-4 w-4 text-green-500" />;
  }
};

export function FoodDisplay({ mealData, isLoading, onLogMeal }: FoodDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-xl animate-pulse">
        <CardHeader className="bg-muted/30">
          <Skeleton className="h-8 w-3/5 rounded-md" />
          <Skeleton className="h-4 w-4/5 mt-1 rounded-md" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <Skeleton className="h-6 w-1/5 rounded-md" />
            </div>
          ))}
           <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/30">
           <Skeleton className="h-12 w-full rounded-lg" />
        </CardFooter>
      </Card>
    );
  }

  if (!mealData || mealData.length === 0) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <Salad className="h-8 w-8 text-primary" />
            Your Meal Details
          </CardTitle>
          <CardDescription>Upload an image to see the nutritional breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg bg-muted/50 border border-dashed border-border">
            <Info className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">Awaiting Food Analysis</p>
            <p className="text-muted-foreground max-w-xs">
              Once you snap or upload a photo of your meal, its nutritional information will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = mealData.reduce(
    (acc, item) => {
      acc.calories += item.nutrientInfo.calories || 0;
      acc.protein += item.nutrientInfo.protein || 0;
      acc.fat += item.nutrientInfo.fat || 0;
      acc.carbs += item.nutrientInfo.carbohydrates || 0;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <Card className="w-full shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
          <TrendingUp className="h-8 w-8 text-primary" />
          Nutritional Breakdown
        </CardTitle>
        <CardDescription>Here's what we found in your meal (values are approximate).</CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-background sticky top-0">
              <TableRow>
                <TableHead className="w-2/5 pl-4 md:pl-6 py-3">Food Item</TableHead>
                <TableHead className="text-right py-3"><NutrientIcon nutrient="calories" /> Calories</TableHead>
                <TableHead className="text-right py-3 hidden sm:table-cell"><NutrientIcon nutrient="protein" /> Protein (g)</TableHead>
                <TableHead className="text-right py-3 hidden sm:table-cell"><NutrientIcon nutrient="fat" /> Fat (g)</TableHead>
                <TableHead className="text-right pr-4 md:pr-6 py-3 hidden sm:table-cell"><NutrientIcon nutrient="carbohydrates" /> Carbs (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealData.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/50 transition-colors duration-150">
                  <TableCell className="font-medium capitalize pl-4 md:pl-6 py-3">{item.name}</TableCell>
                  <TableCell className="text-right font-semibold py-3">~{item.nutrientInfo.calories.toFixed(0)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell py-3">
                    {item.nutrientInfo.protein !== undefined ? `~${item.nutrientInfo.protein.toFixed(0)}g` : '-'}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell py-3">
                    {item.nutrientInfo.fat !== undefined ? `~${item.nutrientInfo.fat.toFixed(0)}g` : '-'}
                  </TableCell>
                  <TableCell className="text-right pr-4 md:pr-6 py-3 hidden sm:table-cell">
                    {item.nutrientInfo.carbohydrates !== undefined ? `~${item.nutrientInfo.carbohydrates.toFixed(0)}g` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         <div className="mt-6 p-4 md:p-6 bg-accent/5 rounded-lg border border-accent/20">
            <h3 className="text-xl font-semibold text-accent mb-4 flex items-center gap-2">
              <Weight className="h-6 w-6" />
              Meal Totals (Approx.)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 text-sm">
              {(Object.keys(totals) as (keyof typeof totals)[]).map(key => (
                <Card key={key} className="p-3 md:p-4 bg-background shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-accent/10 rounded-full mb-2">
                    <NutrientIcon nutrient={key as keyof FoodItem['nutrientInfo'] | 'carbs'} />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    ~{totals[key].toFixed(0)}
                    {key !== 'calories' && <span className="text-xs ml-0.5">g</span>}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {key === 'carbs' ? 'Carbohydrates' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </Card>
              ))}
            </div>
          </div>
      </CardContent>
      <CardFooter className="p-6 bg-muted/30">
        <Button 
          onClick={() => onLogMeal(mealData, totals)} 
          className="w-full py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-100"
          aria-label="Log this meal to history"
          size="lg"
        >
          <StickyNote className="mr-2 h-5 w-5" />
          Log This Meal
        </Button>
      </CardFooter>
    </Card>
  );
}
