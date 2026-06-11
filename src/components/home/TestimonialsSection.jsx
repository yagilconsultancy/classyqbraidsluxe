import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Amara Johnson',
    text: 'The best braiding experience I have ever had. My knotless braids lasted for 8 weeks and looked flawless the entire time!',
    rating: 5,
    style: 'Knotless Braids',
  },
  {
    name: 'Destiny Williams',
    text: 'Absolutely stunning work! The attention to detail is unmatched. I get compliments everywhere I go.',
    rating: 5,
    style: 'Goddess Braids',
  },
  {
    name: 'Keisha Brown',
    text: 'The booking process was so easy — no sign up needed. The hair extensions are premium quality. Will definitely be back!',
    rating: 5,
    style: 'Boho Braids',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-onyx text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Testimonials</span>
          <h2 className="font-display text-3xl lg:text-5xl font-light text-white mt-3">
            What Our <span className="italic text-gold">Clients</span> Say
          </h2>
          <div className="hair-line w-32 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative p-8 border border-white/10 bg-white/5"
            >
              <Quote className="w-8 h-8 text-gold/30 mb-4" />
              <p className="text-sm leading-relaxed text-white/70 mb-6">{t.text}</p>
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <div>
                <p className="font-display text-lg text-white">{t.name}</p>
                <p className="text-xs text-gold/80 uppercase tracking-wider mt-0.5">{t.style}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}