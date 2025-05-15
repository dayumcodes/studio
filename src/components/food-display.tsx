"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FoodItem } from '@/lib/types';
import { Zap, Activity, Droplet, Wheat, Salad, Info, StickyNote } from 'lucide-react';

interface FoodDisplayProps {
  mealData: FoodItem[] | null;
  isLoading: boolean;
  onLogMeal: (mealData: FoodItem[], totals: { calories: number; protein: number; fat: number; carbs: number }) => void;
}

export function FoodDisplay({ mealData, isLoading, onLogMeal }: FoodDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mealData || mealData.length === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Salad className="h-7 w-7 text-primary" />
            Meal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Upload an image of your food to see its nutritional information here.
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Salad className="h-7 w-7 text-primary" />
          Meal Details
        </CardTitle>
        <CardDescription>Here's the breakdown of your recognized meal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Item</TableHead>
              <TableHead className="text-right flex items-center justify-end gap-1"><Zap size={16} />Calories</TableHead>
              <TableHead className="text-right hidden sm:table-cell md:flex items-center justify-end gap-1"><Activity size={16} />Protein (g)</TableHead>
              <TableHead className="text-right hidden sm:table-cell md:flex items-center justify-end gap-1"><Droplet size={16} />Fat (g)</TableHead>
              <TableHead className="text-right hidden sm:table-cell md:flex items-center justify-end gap-1"><Wheat size={16} />Carbs (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mealData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium capitalize">{item.name}</TableCell>
                <TableCell className="text-right">{item.nutrientInfo.calories.toFixed(0)}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{item.nutrientInfo.protein?.toFixed(1) ?? '-'}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{item.nutrientInfo.fat?.toFixed(1) ?? '-'}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{item.nutrientInfo.carbohydrates?.toFixed(1) ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
            <h3 className="text-lg font-semibold text-accent mb-2">Meal Totals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center p-2 bg-background rounded-md shadow-sm">
                <Zap className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold">{totals.calories.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground">Calories</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-background rounded-md shadow-sm">
                <Activity className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold">{totals.protein.toFixed(1)}g</span>
                <span className="text-xs text-muted-foreground">Protein</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-background rounded-md shadow-sm">
                <Droplet className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold">{totals.fat.toFixed(1)}g</span>
                <span className="text-xs text-muted-foreground">Fat</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-background rounded-md shadow-sm">
                <Wheat className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold">{totals.carbs.toFixed(1)}g</span>
                <span className="text-xs text-muted-foreground">Carbs</span>
              </div>
            </div>
          </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onLogMeal(mealData, totals)} 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Log this meal to history"
        >
          <StickyNote className="mr-2 h-5 w-5" />
          Log Meal
        </Button>
      </CardFooter>
    </Card>
  );
}
