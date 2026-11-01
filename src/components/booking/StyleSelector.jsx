import React from 'react';
import { Check, DollarSign } from 'lucide-react';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function StyleSelector({ styles, selected, onSelect }) {
  const [showAll, setShowAll] = React.useState(!selected);
  const visible = selected && !showAll ? styles.filter(s => s.id === selected) : styles;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-onyx">Choose Your Style</h3>
        {selected && !showAll && <button onClick={() => setShowAll(true)} className="text-xs text-gold underline">Change</button>}
      </div>
      {styles.length === 0 ? (
        <p className="text-muted-foreground text-sm">No styles available yet. Please check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map(style => (
            <button
              key={style.id}
              onClick={() => { onSelect(style); setShowAll(false); }}
              className={`flex items-center gap-4 p-4 text-left border transition-all ${
                selected === style.id
                  ? 'border-gold bg-gold/5'
                  : 'border-border hover:border-gold/50'
              }`}
            >
              {style.images?.[0] && (
                <WatermarkedImage src={style.images[0]} alt={style.name} className="w-14 h-14 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-base text-onyx">{style.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-3 h-3" /> From ${style.starting_price}
                </p>
              </div>
              {selected === style.id && (
                <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}