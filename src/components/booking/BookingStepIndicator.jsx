import React from 'react';
import { Check } from 'lucide-react';

export default function BookingStepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center overflow-x-auto pb-2 -mx-4 px-4">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i < currentStep
                  ? 'bg-gold text-white'
                  : i === currentStep
                  ? 'bg-onyx text-white'
                  : 'bg-white border border-border text-muted-foreground'
              }`}
            >
              {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1.5 uppercase tracking-wider whitespace-nowrap ${
              i <= currentStep ? 'text-onyx font-medium' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 lg:w-12 h-[1px] mx-1 mt-[-12px] ${
              i < currentStep ? 'bg-gold' : 'bg-border'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}