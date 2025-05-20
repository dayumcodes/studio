
"use client";

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  adClient: string; // e.g., "ca-pub-XXXXXXXXXXXXXXXX"
  adSlot: string; // e.g., "YYYYYYYYYY"
  adFormat?: string; // e.g., "auto", "rectangle", "vertical", "horizontal"
  style?: CSSProperties;
  className?: string;
  adLayoutKey?: string; // For responsive ads, e.g., "-gw-2x1-2x3"
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

export function AdSenseUnit({
  adClient,
  adSlot,
  adFormat = "auto",
  style = { display: "block" },
  className,
  adLayoutKey,
  fullWidthResponsive = true,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // Ensure adClient and adSlot are provided, otherwise render nothing or a placeholder
  if (!adClient || !adSlot) {
    return (
      <div className={cn("bg-muted/30 text-muted-foreground p-4 text-center rounded-md", className)} style={style}>
        Ad unit not configured (missing client or slot ID).
      </div>
    );
  }
  
  // Basic validation for placeholder IDs
  if (adClient === "ca-pub-XXXXXXXXXXXXXXXX" || adSlot === "YYYYYYYYYY") {
     console.warn("AdSenseUnit: Using placeholder adClient or adSlot. Replace with your actual IDs.");
  }


  return (
    <ins
      ref={adRef}
      className={cn("adsbygoogle", className)}
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout-key={adLayoutKey}
      data-full-width-responsive={fullWidthResponsive ? "true" : undefined}
      aria-label="Advertisement"
    ></ins>
  );
}

// Helper for cn if not already available globally in this component's context
// In a real app, this would likely come from "@/lib/utils"
function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}
