
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
  size = 180, // Default size in pixels
  strokeWidth = 14, // Default stroke width in pixels
  className,
}: CalorieProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate progress, capping visual ring at 100% but allowing color to reflect overage
  const visualProgress = goalCalories > 0 ? Math.min(consumedCalories / goalCalories, 1) : 0;
  const strokeDashoffset = circumference * (1 - visualProgress);

  let progressRingColor = "hsl(var(--primary))"; // Default: Green
  const trackColor = "hsl(var(--muted))"; // Background track color

  if (goalCalories > 0) {
    const percentage = consumedCalories / goalCalories;
    if (percentage > 1) {
      progressRingColor = "hsl(var(--destructive))"; // Red if over goal
    } else if (percentage > 0.75) {
      progressRingColor = "hsl(var(--chart-3))"; // Orange/Amber if nearing goal (75%-100%)
    }
  }

  // Ensure consumedCalories is not negative for display
  const displayConsumedCalories = Math.max(0, consumedCalories);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl shadow-xl bg-card",
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
        className="transform -rotate-90" // Start the progress from the top
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
        {/* Progress Ring */}
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
          style={{ fontSize: Math.max(16, size / 5.5), lineHeight: '1.1' }} // Ensure minimum font size
        >
          ~{Math.round(displayConsumedCalories)}
        </span>
        <span
          className="text-muted-foreground"
          style={{ fontSize: Math.max(10, size / 13), marginTop: size / 30 }} // Ensure minimum font size
        >
          / {goalCalories.toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}
