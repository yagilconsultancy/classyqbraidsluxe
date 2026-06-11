import React from 'react';
import { ShoppingBag, Scissors } from 'lucide-react';

export default function ExtensionSourceStep({ selected, onSelect }) {
  const options = [
    {
      value: 'buy_from_us',
      icon: ShoppingBag,
      title: 'Buy Extensions From Us',
      desc: 'Browse our premium hair extension collection and add to your booking.',
    },
    {
      value: 'own_extensions',
      icon: Scissors,
      title: 'Bringing My Own Extensions',
      desc: 'I already have my hair extensions and will bring them to the appointment.',
    },
  ];

  return (
    <div>
      <h3 className="font-display text-xl text-onyx mb-2">Hair Extensions</h3>
      <p className="text-sm text-muted-foreground mb-6">Will you be purchasing extensions from us, or bringing your own?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(({ value, icon: Icon, title, desc }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`p-5 text-left border-2 transition-all duration-200 ${
              selected === value
                ? 'border-gold bg-gold/5'
                : 'border-border hover:border-gold/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              selected === value ? 'bg-gold text-white' : 'bg-secondary text-muted-foreground'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-onyx text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}