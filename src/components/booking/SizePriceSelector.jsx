import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SIZE_OPTIONS = [
  { value: 'extra_small', label: 'Extra Small', desc: 'Very fine, delicate braids' },
  { value: 'small', label: 'Small', desc: 'Delicate, thin braids' },
  { value: 'small_medium', label: 'Small-Medium', desc: 'Slightly fuller braids' },
  { value: 'medium', label: 'Medium', desc: 'Classic, versatile size' },
  { value: 'large', label: 'Large', desc: 'Bold, statement braids' },
  { value: 'extra_large', label: 'Extra Large', desc: 'Dramatic, voluminous look' },
];

export default function SizePriceSelector({ selected, onSelect, sizePrices = {}, sizeContactUs = [], startingPrice = 0 }) {
  const [showAll, setShowAll] = React.useState(!selected);
  const visible = selected && !showAll ? SIZE_OPTIONS.filter(o => o.value === selected) : SIZE_OPTIONS;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-xl text-onyx">Select Hair Size</h3>
        {selected && !showAll && <button onClick={() => setShowAll(true)} className="text-xs text-gold underline">Change</button>}
      </div>
      <p className="text-xs text-muted-foreground mb-6">Price shown per size. Final total calculated at checkout.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((opt, idx) => {
          const price = sizePrices?.[opt.value];
          const isContactUs = sizeContactUs.includes(opt.value);
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              
              onClick={() => { if (isSelected && !showAll) return setShowAll(true); onSelect(opt.value, isContactUs ? 0 : (price != null ? price : startingPrice), isContactUs); setShowAll(false); }}
              className={`rounded-2xl p-4 text-left border-2 transition-colors hover:shadow-md ${
                isSelected ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-onyx">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  {isContactUs ? (
                    <p className="text-xs font-medium text-gold mt-1 italic">Contact us for price</p>
                  ) : price != null ? (
                    <p className="text-sm font-semibold text-gold mt-1">${price}</p>
                  ) : (
                    <p className="text-sm font-semibold text-gold mt-1">${startingPrice}</p>
                  )}
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0 ml-3">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}