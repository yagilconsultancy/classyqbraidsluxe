import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Adedunni',
    text: 'My boho braids were pure magic. Soft, full, and so natural. Lasted weeks and looked even better over time!',
    rating: 5,
    style: 'Boho Braids',
  },
  {
    name: 'Oppy',
    text: 'The Fulani braids exceeded my expectations. Every detail was intentional. I get compliments everywhere I go.',
    rating: 5,
    style: 'Fulani Braids',
  },
  {
    name: 'Cynthia',
    text: 'The best locs experience hands down. Neat, clean, and beautifully maintained. ClassyqBraidsLuxe is my go-to.',
    rating: 5,
    style: 'Locs',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 lg:py-28 bg-onyx text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 right-1/4 w-[32rem] h-[32rem] rounded-full bg-gold/10 blur-[120px]" />
      {/* Golden box pattern — like the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: '#111111',
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(157,123,28,0.06) 0px, rgba(157,123,28,0.06) 1px, transparent 1px, transparent 12px), radial-gradient(circle at 1px 1px, rgba(157,123,28,0.20) 1px, transparent 0)',
          backgroundSize: '100% 100%, 22px 22px',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="group relative bg-white/[0.03] border border-white/10 rounded-[1.5rem_0.5rem_1.75rem_0.75rem] p-8 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-gold/40 hover:bg-white/[0.05]"
            >
              {/* corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-gold/40 rounded-tr-[1.5rem] opacity-70" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-gold/30 rounded-bl-[0.5rem] opacity-60" />

              <div className="relative flex items-start gap-4 mb-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border border-gold/30 flex items-center justify-center font-display text-lg text-gold">
                  {t.name.charAt(0)}
                </div>
                <Quote className="w-8 h-8 text-gold/40 -scale-x-100" />
              </div>
              <p className="relative text-sm leading-relaxed text-white/80 mb-6 italic font-light">"{t.text}"</p>
              <div className="relative flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <div className="relative h-px w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent mb-4" />
              <div className="relative">
                <p className="font-display text-xl text-white">{t.name}</p>
                <p className="text-xs text-gold/90 uppercase tracking-[0.2em] mt-1">{t.style}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}