import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LegalLayout({ title, lastUpdated, intro, sections }) {
  return (
    <div className="bg-beige min-h-screen">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-gold" />
            <span className="text-gold text-[0.6rem] uppercase tracking-[0.4em] font-medium font-body">
              Legal
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-onyx font-light mb-3">{title}</h1>
          {lastUpdated && (
            <p className="text-xs text-onyx/50 uppercase tracking-[0.15em] font-body mb-10">
              Last updated: {lastUpdated}
            </p>
          )}
          {intro && (
            <p className="text-onyx/70 text-sm lg:text-base leading-relaxed mb-12 font-body">
              {intro}
            </p>
          )}

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="font-display text-xl lg:text-2xl text-onyx mb-3 font-medium">
                  {section.heading}
                </h2>
                {section.body && (
                  <p className="text-onyx/70 text-sm lg:text-[0.95rem] leading-relaxed font-body mb-3">
                    {section.body}
                  </p>
                )}
                {section.list && (
                  <ul className="space-y-2.5">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex gap-3 text-onyx/70 text-sm lg:text-[0.95rem] leading-relaxed font-body">
                        <span className="text-gold mt-1.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="hair-line my-12" />

          <p className="text-xs text-onyx/50 font-body leading-relaxed">
            Questions about this policy? Reach us at{' '}
            <a href="mailto:hello@classyqbraidsluxe.com" className="text-gold hover:underline">
              hello@classyqbraidsluxe.com
            </a>{' '}
            or{' '}
            <a href="tel:+14372996513" className="text-gold hover:underline">
              (437) 299-6513
            </a>
            .
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-8 text-xs uppercase tracking-[0.15em] text-onyx/60 hover:text-gold transition-colors font-body"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}