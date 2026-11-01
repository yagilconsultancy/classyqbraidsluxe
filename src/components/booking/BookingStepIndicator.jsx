import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

export default function BookingStepIndicator({ steps, currentStep, onStepClick }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentStep]);

  return (
    <div className="flex items-center justify-start md:justify-center overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
      {steps.map((label, i) => {
        const done = i < currentStep;
        return (
          <React.Fragment key={i}>
            <button
              type="button"
              ref={i === currentStep ? activeRef : null}
              disabled={!done}
              onClick={() => onStepClick?.(i)}
              aria-label={done ? `Go back to ${label}` : label}
              className="flex flex-col items-center shrink-0 disabled:cursor-default"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  done
                    ? 'bg-gold text-white hover:ring-2 hover:ring-gold/40'
                    : i === currentStep
                    ? 'bg-onyx text-white'
                    : 'bg-white border border-border text-muted-foreground'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1.5 uppercase tracking-wider whitespace-nowrap ${
                i <= currentStep ? 'text-onyx font-medium' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 lg:w-12 h-[1px] mx-1 mt-[-12px] shrink-0 ${done ? 'bg-gold' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}