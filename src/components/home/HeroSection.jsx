import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-onyx">
      {/* Background Image */}
      <div className="absolute inset-0">
        <WatermarkedImage
          src={heroImage}
          alt="Luxury hair braiding"
          className="w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
        <div className="max-w-2xl">
          {/* Brand monogram + eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="font-display text-2xl text-gold italic">Cq</span>
            <div className="w-12 h-px bg-gold/40" />
            <span className="text-gold/90 text-[0.65rem] uppercase tracking-[0.4em] font-medium">
              London · Ontario
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl sm:text-5xl lg:text-[5.5rem] text-white font-light leading-[1.05] mb-8 tracking-tight"
          >
            The Art of<br />
            <span className="italic text-gold">Luxury</span> Braiding<br />
            <span className="text-white/50 text-3xl sm:text-4xl lg:text-5xl">& Extensions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/55 text-sm lg:text-base font-body max-w-md mb-12 leading-relaxed font-light"
          >
            Where artistry meets elegance. Experience exceptional beauty with our premium braiding services and curated hair extensions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/book">
              <Button className="bg-gold hover:bg-gold/90 text-white text-xs uppercase tracking-[0.15em] rounded-none px-8 h-12 w-full sm:w-auto transition-all duration-300 group">
                Book Appointment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-onyx text-xs uppercase tracking-[0.15em] rounded-none px-8 h-12 w-full sm:w-auto transition-all duration-300">
                Shop Extensions
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3"
      >
        <span className="text-white/40 text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold via-gold/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}