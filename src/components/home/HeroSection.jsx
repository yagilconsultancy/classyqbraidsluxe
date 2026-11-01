import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function HeroSection({ heroImage }) {
  const { data: images = [] } = useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const [styles, products] = await Promise.all([
        base44.entities.Hairstyle.filter({ is_active: true }),
        base44.entities.Product.filter({ is_active: true, product_type: 'extension' }),
      ]);
      return [...styles, ...products].map(i => i.images?.[0]).filter(Boolean);
    },
  });
  const slides = images.length ? images : [heroImage].filter(Boolean);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative w-full bg-[#2a2420] overflow-hidden">
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-gold/10 blur-[120px]" />
      <span className="pointer-events-none absolute -left-10 top-0 font-display text-[40rem] leading-none text-white/[0.03] select-none">Q</span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="text-gold text-xs font-body mb-4">Braids &amp; Extensions · London, Ontario</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
            <span className="text-white">Braid, </span>
            <span className="italic text-gold">beautifully.</span>
            <br />
            <span className="text-white/70">Extensions to match.</span>
          </motion.h1>
          <p className="text-white/70 font-body text-base lg:text-lg max-w-md mb-8 leading-relaxed">
            Expert braiding and curated hair extensions, made with care in every strand.
          </p>
          <p className="sr-only">
            ClassyqBraidsLuxe is a luxury hair braiding salon in London, Ontario specializing in knotless braids, box braids, goddess braids, boho braids, cornrows and premium hair extensions.
          </p>
          <div className="flex flex-wrap items-center gap-6 mb-10">
            <Link to="/book" className="bg-gold hover:bg-gold/90 text-onyx text-sm font-medium rounded-full px-6 py-3 transition-colors">
              Book an appointment
            </Link>
            <Link to="/shop" className="text-gold text-sm inline-flex items-center gap-1 hover:underline underline-offset-4">
              Shop extensions <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="border-t border-white/10 pt-6 flex gap-10 max-w-sm">
            {[['300+', 'Happy clients'], ['30+', 'Signature styles'], ['5.0', 'Client rating']].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl text-white leading-none mb-1">{n}</p>
                <p className="text-white/60 text-xs font-body">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl border border-gold/40" />
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5">
            <AnimatePresence>
              {slides[idx] && (
                <motion.div
                  key={slides[idx]}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  <WatermarkedImage src={slides[idx]} alt="ClassyqBraidsLuxe style" className="w-full h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}