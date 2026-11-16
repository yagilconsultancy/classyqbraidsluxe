import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function BookingStepIndicator({ steps, currentStep, onStepClick }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentStep]);

  return (
    <div className="scrollbar-none -mx-4 flex items-center justify-start overflow-x-auto px-4 pb-2 pt-3 md:justify-center">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={i}>
            <motion.button
              type="button"
              ref={active ? activeRef : null}
              disabled={!done}
              onClick={() => onStepClick?.(i)}
              aria-label={done ? `Go back to ${label}` : label}
              aria-current={active ? 'step' : undefined}
              whileHover={done ? { y: -2 } : undefined}
              whileTap={done ? { scale: 0.92 } : undefined}
              className="flex shrink-0 flex-col items-center disabled:cursor-default"
            >
              <span className="relative flex h-9 w-9 items-center justify-center">
                {active && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-gold/30"
                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.span
                  animate={{ scale: active ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300 ${
                    done
                      ? 'bg-gold text-white hover:ring-2 hover:ring-gold/40'
                      : active
                      ? 'bg-onyx text-white'
                      : 'border border-border bg-white text-muted-foreground'
                  }`}
                >
                  {done ? (
                    <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  ) : (
                    i + 1
                  )}
                </motion.span>
              </span>
              <span className={`mt-1.5 whitespace-nowrap text-[10px] uppercase tracking-wider transition-colors ${i <= currentStep ? 'font-medium text-onyx' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </motion.button>
            {i < steps.length - 1 && (
              <div className="relative mx-1 mt-[-12px] h-[2px] w-8 shrink-0 overflow-hidden rounded-full bg-border lg:w-12">
                <motion.div
                  className="absolute inset-0 origin-left bg-gold"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
