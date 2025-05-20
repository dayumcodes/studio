import Link from 'next/link';
import { AppLogo } from '@/components/icons/app-logo';

export function AppHeader() {
  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 border-b border-border/80 shadow-sm sticky top-0 bg-background/90 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group" aria-label="calorietracker.ai Home">
          <AppLogo className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <h1 className="text-2xl font-bold text-primary tracking-tight group-hover:text-primary/90 transition-colors">
            calorietracker.ai
          </h1>
        </Link>
      </div>
    </header>
  );
}
