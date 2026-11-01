import React from 'react';
import { Check } from 'lucide-react';

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
        {visible.map(opt => {
          const price = sizePrices?.[opt.value];
          const isContactUs = sizeContactUs.includes(opt.value);
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { if (isSelected && !showAll) return setShowAll(true); onSelect(opt.value, isContactUs ? 0 : (price != null ? price : startingPrice), isContactUs); setShowAll(false); }}
              className={`p-4 text-left border transition-all ${
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
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0 ml-3">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}