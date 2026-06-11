import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Heart, Shield } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Expert Artistry',
    desc: 'Years of professional experience in precision braiding and styling techniques.',
  },
  {
    icon: Heart,
    title: 'Premium Products',
    desc: '100% quality hair extensions and products for lasting, beautiful results.',
  },
  {
    icon: Clock,
    title: 'Effortless Booking',
    desc: 'Book your appointment in seconds — no account required, instant confirmation.',
  },
  {
    icon: Shield,
    title: 'Satisfaction Guaranteed',
    desc: 'We stand behind our work with complete customer satisfaction assurance.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">The Difference</span>
          <h2 className="font-display text-3xl lg:text-5xl font-light text-onyx mt-3">
            Why Choose <span className="italic">ClassyqBraidsLuxe</span>
          </h2>
          <div className="hair-line w-32 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-gold/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl text-onyx mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}