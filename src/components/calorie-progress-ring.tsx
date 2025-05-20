
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface CalorieProgressRingProps {
  consumedCalories: number;
  goalCalories: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CalorieProgressRing({
  consumedCalories,
  goalCalories,
  size = 180, 
  strokeWidth = 14, 
  className,
}: CalorieProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const visualProgress = goalCalories > 0 ? Math.min(consumedCalories / goalCalories, 1) : 0;
  const strokeDashoffset = circumference * (1 - visualProgress);

  let progressRingColor = "hsl(var(--primary))"; // Default: Green (var --chart-1)
  const trackColor = "hsl(var(--muted))"; 

  if (goalCalories > 0) {
    const percentage = consumedCalories / goalCalories;
    if (percentage > 1) {
      progressRingColor = "hsl(var(--destructive))"; 
    } else if (percentage > 0.75) {
      progressRingColor = "hsl(var(--chart-3))"; // Orange/Amber
    }
  }

  const displayConsumedCalories = Math.max(0, consumedCalories);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl shadow-lg bg-card", // Updated to rounded-xl
        className
      )}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={displayConsumedCalories}
      aria-valuemin={0}
      aria-valuemax={goalCalories}
      aria-label={`Calorie consumption: approx. ${Math.round(displayConsumedCalories)} of ${goalCalories} kcal`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90" 
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={progressRingColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out' }}
          aria-hidden="true"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          className="font-bold text-foreground"
          style={{ fontSize: Math.max(18, size / 5.2), lineHeight: '1.1' }} // Adjusted font size
        >
          ~{Math.round(displayConsumedCalories)}
        </span>
        <span
          className="text-muted-foreground"
          style={{ fontSize: Math.max(11, size / 12.5), marginTop: size / 30 }} // Adjusted font size
        >
          / {goalCalories.toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}
