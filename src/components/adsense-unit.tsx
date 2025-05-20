
"use client";

import * as React from 'react'; // Added this line
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Ensure cn is imported
import { ImageOff } from 'lucide-react';

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
  const [isConfigured, setIsConfigured] = React.useState(false);

  useEffect(() => {
    if (adClient && adSlot && adClient !== "ca-pub-XXXXXXXXXXXXXXXX" && adSlot !== "YYYYYYYYYY") {
      setIsConfigured(true);
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    } else {
      setIsConfigured(false);
      console.warn("AdSenseUnit: Using placeholder adClient or adSlot. Replace with your actual IDs for ads to display.");
    }
  }, [adClient, adSlot]);

  if (!isConfigured) {
    return (
      <div
        className={cn(
          "bg-muted/40 text-muted-foreground p-6 text-center rounded-lg border border-dashed border-border",
          "flex flex-col items-center justify-center aspect-video max-h-[250px] min-h-[100px]", // Ensure it has some dimensions
          className
        )}
        style={style}
        role="complementary"
        aria-label="Advertisement Placeholder"
      >
        <ImageOff className="w-12 h-12 mb-2 text-muted-foreground/70" />
        <p className="font-medium">Advertisement Area</p>
        <p className="text-xs">Ad unit not fully configured.</p>
      </div>
    );
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
