import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

function Orb({ className, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      animate={reduce ? undefined : { y: [0, -24, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// Shared animated page header: eyebrow, word-by-word headline with an italic last word, intro, gold rule.
export default function PageHero({ eyebrow, words, italic, children }) {
  return (
    <div className="relative overflow-hidden">
      <Orb className="-left-24 top-0 h-72 w-72 bg-gold/20" />
      <Orb className="-right-20 top-20 h-64 w-64 bg-amber-200/40" delay={2} />
      <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          animate={{ opacity: 1, letterSpacing: '0.3em' }}
          transition={{ duration: 1, ease: EASE }}
          className="text-xs font-medium uppercase text-gold"
        >
          {eyebrow}
        </motion.span>
        <h1 className="mt-3 font-display text-4xl font-light text-onyx lg:text-6xl">
          {words.map((w, i) => (
            <span key={w} className="mr-3 inline-block overflow-hidden align-bottom">
              <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: EASE }}>
                {w}
              </motion.span>
            </span>
          ))}
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span className="inline-block italic" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + words.length * 0.12, duration: 0.8, ease: EASE }}>
              {italic}
            </motion.span>
          </span>
        </h1>
        {children && (
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease: EASE }} className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {children}
          </motion.p>
        )}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.9, ease: EASE }} className="hair-line mx-auto mt-6 w-32 origin-center" />
      </div>
    </div>
  );
}
