import React from 'react';
import { Check } from 'lucide-react';

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
        {visible.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); setShowAll(false); }}
            className={`p-4 text-left border transition-all ${
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
                <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0 ml-3">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}