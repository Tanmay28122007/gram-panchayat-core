import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-[#FFF8E6] text-[#8A7000] border-b border-[#F4E1A1] text-xs font-bold h-8 flex items-center sticky top-0 z-[100] overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex items-center w-max">
        <span className="inline-flex items-center gap-2 uppercase tracking-wide mx-8">
          <AlertTriangle className="w-3.5 h-3.5" />
          DISCLAIMER: This application is an educational prototype developed for academic purposes. It is not an official government portal.
        </span>
        <span className="inline-flex items-center gap-2 uppercase tracking-wide mx-8" aria-hidden="true">
          <AlertTriangle className="w-3.5 h-3.5" />
          DISCLAIMER: This application is an educational prototype developed for academic purposes. It is not an official government portal.
        </span>
      </div>
    </div>
  );
}
