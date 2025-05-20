
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FoodItem } from '@/lib/types';
import { Zap, Beef, Salad, Info, StickyNote, TrendingUp, Wheat, CookingPot } from 'lucide-react'; // Added CookingPot for generic Fat
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FoodDisplayProps {
  mealData: FoodItem[] | null;
  isLoading: boolean;
  onLogMeal: (mealData: FoodItem[], totals: { calories: number; protein: number; fat: number; carbs: number }) => void;
}

const NutrientIcon = ({ nutrient, className = "h-5 w-5" }: { nutrient: keyof FoodItem['nutrientInfo'] | 'name' | 'carbs', className?: string }) => {
  switch(nutrient) {
    case 'calories': return <Zap className={cn("text-orange-500", className)} />;
    case 'protein': return <Beef className={cn("text-red-500", className)} />; 
    case 'fat': return <CookingPot className={cn("text-yellow-500", className)} />; // Using CookingPot as placeholder for fats
    case 'carbs': 
    case 'carbohydrates': return <Wheat className={cn("text-amber-600", className)} />;
    default: return <Salad className={cn("text-green-500", className)} />;
  }
};

export function FoodDisplay({ mealData, isLoading, onLogMeal }: FoodDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-xl animate-pulse">
        <CardHeader className="bg-muted/30 p-4 md:p-6">
          <Skeleton className="h-8 w-3/5 rounded-md" />
          <Skeleton className="h-4 w-4/5 mt-2 rounded-md" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-border/50 last:border-b-0">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <Skeleton className="h-6 w-1/5 rounded-md" />
            </div>
          ))}
           <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 md:p-6 bg-muted/30">
           <Skeleton className="h-12 w-full rounded-lg" />
        </CardFooter>
      </Card>
    );
  }

  if (!mealData || mealData.length === 0) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="bg-muted/30 p-4 md:p-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <Salad className="h-8 w-8 text-primary" />
            Your Meal Details
          </CardTitle>
          <CardDescription>Upload an image to see the nutritional breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
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
      <CardHeader className="bg-muted/30 p-4 md:p-6">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
          <TrendingUp className="h-8 w-8 text-primary" />
          Nutritional Breakdown
        </CardTitle>
        <CardDescription>Here's what we found in your meal (values are approximate).</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/20 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-2/5 pl-4 md:pl-6 py-3 text-sm font-medium text-muted-foreground">Food Item</TableHead>
                <TableHead className="text-right py-3 text-sm font-medium text-muted-foreground flex items-center justify-end gap-1"><NutrientIcon nutrient="calories" className="h-4 w-4" /> Calories</TableHead>
                <TableHead className="text-right py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell "><NutrientIcon nutrient="protein" className="h-4 w-4 inline-block mr-1" /> Protein (g)</TableHead>
                <TableHead className="text-right py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell"><NutrientIcon nutrient="fat" className="h-4 w-4 inline-block mr-1" /> Fat (g)</TableHead>
                <TableHead className="text-right pr-4 md:pr-6 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell"><NutrientIcon nutrient="carbohydrates" className="h-4 w-4 inline-block mr-1" /> Carbs (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealData.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-b-0">
                  <TableCell className="font-medium capitalize pl-4 md:pl-6 py-4 text-foreground">{item.name}</TableCell>
                  <TableCell className="text-right font-semibold py-4 text-foreground">~{item.nutrientInfo.calories.toFixed(0)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell py-4 text-foreground/90">
                    {item.nutrientInfo.protein !== undefined ? `~${item.nutrientInfo.protein.toFixed(0)}g` : '-'}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell py-4 text-foreground/90">
                    {item.nutrientInfo.fat !== undefined ? `~${item.nutrientInfo.fat.toFixed(0)}g` : '-'}
                  </TableCell>
                  <TableCell className="text-right pr-4 md:pr-6 py-4 text-foreground/90 hidden sm:table-cell">
                    {item.nutrientInfo.carbohydrates !== undefined ? `~${item.nutrientInfo.carbohydrates.toFixed(0)}g` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         <div className="mt-6 p-4 md:p-6 bg-accent/5 rounded-lg border border-accent/20 mx-4 md:mx-6 mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-accent mb-4 flex items-center gap-2">
              {/* Using a generic icon as Weight might be too specific */}
              <Salad className="h-6 w-6" /> 
              Meal Totals (Approx.)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {(Object.keys(totals) as (keyof typeof totals)[]).map(key => (
                <Card key={key} className="p-3 md:p-4 bg-background shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center text-center rounded-lg">
                  <div className="p-2.5 bg-accent/10 rounded-full mb-2">
                    <NutrientIcon nutrient={key as keyof FoodItem['nutrientInfo'] | 'carbs'} className="h-6 w-6"/>
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    ~{totals[key].toFixed(0)}
                    {key !== 'calories' && <span className="text-xs ml-0.5">g</span>}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {key === 'carbs' ? 'Carbs' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </Card>
              ))}
            </div>
          </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 bg-muted/30">
        <Button 
          onClick={() => onLogMeal(mealData, totals)} 
          className="w-full py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-150 ease-in-out transform hover:scale-[1.02] active:scale-100 rounded-lg"
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
