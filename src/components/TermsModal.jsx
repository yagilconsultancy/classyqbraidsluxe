import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const TERMS_KEY = 'terms_accepted_v1';

export function hasAcceptedTerms() {
  try {
    return sessionStorage.getItem(TERMS_KEY) === 'true';
  } catch {
    return false;
  }
}

function setAccepted() {
  try {
    sessionStorage.setItem(TERMS_KEY, 'true');
  } catch {
    /* ignore */
  }
}

const POLICY = [
  {
    title: 'Booking & Payment',
    items: [
      '$30 deposit required to secure your appointment. Non-refundable.',
      'Balance due in CASH on the day of your appointment.',
    ],
  },
  {
    title: 'Hair & Extensions',
    items: [
      'Pre-stretched extensions only will be used.',
      'Extra length/volume = extra fee.',
      'Hair must come washed, detangled, and blow-dried/combed out.',
      '+$10 for detangling · +$10 for blow dry',
    ],
  },
  {
    title: 'Cancellations & Rescheduling',
    items: [
      'Cancel/reschedule at least 48 hours before your appointment.',
      'Cancellations less than 36 hours = deposit forfeited.',
    ],
  },
  {
    title: 'Lateness',
    items: [
      'Please notify us if you’re running late.',
      '15 min grace period given.',
      '30+ min late with no communication = appointment may be cancelled.',
    ],
  },
];

export default function TermsModal({ open, onAgree, onDecline, context = 'booking' }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  const heading =
    context === 'shop'
      ? 'Before You Shop'
      : 'Before You Book';

  const subheading =
    context === 'shop'
      ? 'Please review our terms and agree to continue shopping.'
      : 'Please review our booking policy and agree to continue.';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-onyx/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25 }}
            className="bg-beige w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="block w-8 h-px bg-gold" />
                <span className="text-gold text-[0.6rem] uppercase tracking-[0.4em] font-medium font-body">
                  Classyqbraids
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-onyx font-light mb-2">
                {heading}
              </h2>
              <p className="text-onyx/60 text-sm font-body mb-6">{subheading}</p>

              <div className="space-y-5 mb-6">
                {POLICY.map((section) => (
                  <div key={section.title}>
                    <h3 className="font-display text-base text-onyx font-medium mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-1.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-onyx/70 text-sm font-body leading-relaxed">
                          <span className="text-gold mt-1.5 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="text-onyx/80 text-sm font-body italic mb-5">
                Thank you for choosing Classyqbraids 💛 We can’t wait to braid you!
              </p>

              <Link
                to="/terms-of-service"
                className="text-xs uppercase tracking-[0.15em] text-gold hover:underline font-body"
              >
                View Full Terms of Service →
              </Link>

              <div className="hair-line my-6" />

              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#9D7B1C] cursor-pointer"
                />
                <span className="text-onyx/70 text-sm font-body leading-relaxed">
                  I have read and agree to the ClassyqBraidsLuxe Terms of Service and booking policy.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setAccepted();
                    onAgree?.();
                  }}
                  disabled={!checked}
                  className="bg-gold text-white hover:bg-gold/90 rounded-none text-xs uppercase tracking-wider h-11 px-8 flex-1"
                >
                  I Agree & Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={onDecline}
                  className="rounded-none text-xs uppercase tracking-wider h-11 px-6 border-onyx/30 text-onyx hover:bg-onyx hover:text-white"
                >
                  Decline
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { TERMS_KEY };