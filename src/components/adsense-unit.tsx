
"use client";

import * as React from 'react'; 
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; 
import { ImageOff, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

interface AdSenseUnitProps {
  adClient: string; 
  adSlot: string; 
  adFormat?: string; 
  style?: CSSProperties;
  className?: string;
  adLayoutKey?: string; 
  fullWidthResponsive?: boolean;
  "data-ai-hint"?: string; // For the main wrapper if needed
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
  "data-ai-hint": dataAiHint,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null); // HTMLModElement is for <ins>
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  useEffect(() => {
    if (adClient && adSlot && adClient !== "ca-pub-XXXXXXXXXXXXXXXX" && adSlot !== "YYYYYYYYYY") {
      setIsConfigured(true);
      setLoadError(false); // Reset error on re-configure
      try {
        // Ensure adsbygoogle array exists
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (err) {
        console.error("AdSense push error:", err);
        setLoadError(true);
      }
    } else {
      setIsConfigured(false);
      // No console.warn needed here as the placeholder will be visible
    }
  }, [adClient, adSlot, adFormat, adLayoutKey, fullWidthResponsive]); // Re-run if any of these change

  if (!isConfigured || loadError) {
    return (
      <div
        className={cn(
          "bg-muted/40 text-muted-foreground p-6 text-center rounded-lg border border-dashed border-border",
          "flex flex-col items-center justify-center min-h-[150px] max-h-[250px]", 
          className
        )}
        style={style} // Apply passed style to placeholder too
        role="complementary"
        aria-label="Advertisement Placeholder"
        data-ai-hint={dataAiHint || "advertisement placeholder"}
      >
        {loadError ? (
           <AlertTriangle className="w-12 h-12 mb-2 text-destructive" />
        ) : (
           <ImageOff className="w-12 h-12 mb-2 text-muted-foreground/70" />
        )}
        <p className="font-medium text-sm">
          {loadError ? "Ad Load Error" : "Advertisement Area"}
        </p>
        <p className="text-xs mt-1">
          {loadError 
            ? "There was an issue loading the ad." 
            : "Ad unit not configured or Ad Blocker active."}
        </p>
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
      data-ai-hint={dataAiHint} // Pass through ai-hint
    ></ins>
  );
}
