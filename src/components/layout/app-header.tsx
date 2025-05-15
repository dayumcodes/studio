import Link from 'next/link';
import { AppLogo } from '@/components/icons/app-logo';

export function AppHeader() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border/60 shadow-sm sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="calorietracker.ai Home">
          <AppLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            calorietracker.ai
          </h1>
        </Link>
      </div>
    </header>
  );
}
