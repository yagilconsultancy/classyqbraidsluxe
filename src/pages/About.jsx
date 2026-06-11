import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Heart, Sparkles } from 'lucide-react';

const stats = [
  { icon: Users, value: '5,000+', label: 'Happy Clients' },
  { icon: Award, value: '10+', label: 'Years Experience' },
  { icon: Heart, value: '50+', label: 'Braid Styles' },
  { icon: Sparkles, value: '100%', label: 'Satisfaction' },
];

export default function About() {
  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Our Story</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          About <span className="italic">ClassyqBraidsLuxe</span>
        </h1>
        <div className="hair-line w-32 mx-auto mt-6" />
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 lg:p-12 shadow-sm mb-12"
        >
          <h2 className="font-display text-2xl lg:text-3xl text-onyx mb-6">The Art of <span className="italic text-gold">Braiding</span></h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              ClassyqBraidsLuxe was born from a passion for the ancient art of hair braiding and a commitment to elevating it to a luxury experience. What began as a personal journey into the world of protective styling has evolved into a premier destination for women who demand nothing but excellence.
            </p>
            <p>
              Every braid we create is a masterpiece — a harmonious blend of traditional technique and contemporary style. We believe that your hair is your crown, and we treat every client as royalty. Our studio is designed to be a sanctuary where you can relax, unwind, and emerge transformed.
            </p>
            <p>
              Beyond braiding, we curate the finest premium hair extensions, meticulously sourced to ensure quality, longevity, and a natural look. Our commitment extends from the chair to the shelf — every product we offer meets our exacting standards.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-onyx text-white p-8 lg:p-12 mb-12"
        >
          <h2 className="font-display text-2xl lg:text-3xl mb-4">Our <span className="italic text-gold">Mission</span></h2>
          <p className="text-white/70 leading-relaxed">
            To redefine the hair braiding experience by merging artistry with luxury. We aim to empower every woman to express her unique beauty through premium styling services and products, delivered with exceptional care and professionalism.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 text-center shadow-sm"
              >
                <Icon className="w-6 h-6 text-gold mx-auto mb-3" />
                <p className="font-display text-2xl lg:text-3xl text-onyx">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}