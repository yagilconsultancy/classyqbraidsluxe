import React from 'react';
import { ShoppingBag, Scissors, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
        {options.map(({ value, icon: Icon, title, desc }, idx) => (
          <motion.button
            key={value}
            onClick={() => onSelect(value)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`relative rounded-2xl p-5 text-left border-2 transition-colors hover:shadow-lg ${
              selected === value
                ? 'border-gold bg-gold/5'
                : 'border-border hover:border-gold/50'
            }`}
          >
            <motion.div
              animate={selected === value ? { rotate: [0, -12, 10, 0], scale: [1, 1.18, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                selected === value ? 'bg-gold text-white' : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            {selected === value && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold">
                <Check className="h-3.5 w-3.5 text-white" />
              </motion.span>
            )}
            <p className="font-medium text-onyx text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}