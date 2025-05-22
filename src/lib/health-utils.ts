
import type { UserProfile } from '@/lib/types';
import { DEFAULT_DAILY_GOAL } from '@/lib/constants';

export const calculateBMR = (profile: UserProfile): number => {
  let bmr: number;
  // Mifflin-St Jeor Equation is generally more accurate
  if (profile.gender === 'male') {
    bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) + 5;
  } else if (profile.gender === 'female') {
    bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) - 161;
  } else {
    // For 'prefer_not_to_say', we can average male and female or use a general multiplier.
    // Let's use a rough average for now.
    const bmrMale = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) + 5;
    const bmrFemale = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) - 161;
    bmr = (bmrMale + bmrFemale) / 2;
  }

  const activityMultipliers: Record<UserProfile['activityLevel'], number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.2);
  
  // Ensure TDEE is at least a minimum viable calorie goal, otherwise use default.
  return Math.round(tdee > 1000 ? tdee : DEFAULT_DAILY_GOAL); 
};
