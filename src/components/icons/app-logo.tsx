import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
        fill="hsl(var(--primary))" 
      />
      <path
        d="M16.5 7.5H7.5C6.67 7.5 6 8.17 6 9V15C6 15.83 6.67 16.5 7.5 16.5H16.5C17.33 16.5 18 15.83 18 15V9C18 8.17 17.33 7.5 16.5 7.5ZM9.5 14.5H7.5V12.5H9.5V14.5ZM9.5 11.5H7.5V9.5H9.5V11.5ZM12.5 14.5H10.5V12.5H12.5V14.5ZM12.5 11.5H10.5V9.5H12.5V11.5ZM15.5 14.5H13.5V12.5H15.5V14.5ZM15.5 11.5H13.5V9.5H15.5V11.5Z"
        fill="hsl(var(--primary-foreground))"
        fillOpacity="0.9"
      />
       <circle cx="12" cy="12" r="2.5" fill="hsl(var(--background))" />
       <circle cx="12" cy="12" r="1.5" fill="hsl(var(--primary))" />
    </svg>
  );
}
