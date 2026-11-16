import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OptionSelector({ title, options, selected, onSelect }) {
  const [showAll, setShowAll] = React.useState(!selected);
  const visible = selected && !showAll ? options.filter(o => o.value === selected) : options;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-onyx">{title}</h3>
        {selected && !showAll && <button onClick={() => setShowAll(true)} className="text-xs text-gold underline">Change</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((opt, idx) => (
          <motion.button
            key={opt.value}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => { if (selected === opt.value && !showAll) return setShowAll(true); onSelect(opt.value); setShowAll(false); }}
            className={`rounded-2xl p-4 text-left border-2 transition-colors hover:shadow-md ${
              selected === opt.value
                ? 'border-gold bg-gold/5'
                : 'border-border hover:border-gold/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-onyx">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
              {selected === opt.value && (
                <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0 ml-3">
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}