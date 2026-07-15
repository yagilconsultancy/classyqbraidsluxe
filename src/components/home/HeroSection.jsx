import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen w-full bg-onyx flex flex-col lg:flex-row overflow-hidden">
      {/* Left — Editorial text panel */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[46%] px-6 sm:px-12 lg:pl-20 lg:pr-10 py-16 lg:py-0 min-h-[60vh] lg:min-h-screen">
        {/* Vertical accent rail */}
        <div className="hidden lg:flex absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

        {/* Top meta row */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-10 lg:mb-16"
        >
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-gold" />
            <span className="text-gold/90 text-[0.6rem] uppercase tracking-[0.45em] font-medium">
              London · Ontario
            </span>
          </div>
          <span className="hidden sm:block text-white/30 text-[0.6rem] uppercase tracking-[0.4em] font-body">
            Est. 2024
          </span>
        </motion.div>

        {/* Headline — mixed editorial weights */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-white leading-[0.95] mb-8"
        >
          <span className="block text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
            Braid,
          </span>
          <span className="block text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
            <span className="italic text-gold">beautifully.</span>
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-white/45 mt-3 tracking-wide">
            Extensions to match.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/55 text-sm lg:text-[0.95rem] font-body max-w-md mb-10 leading-relaxed font-light"
        >
          An atelier of braiding and curated hair extensions in London, Ontario — where artistry, texture, and care meet in every strand.
        </motion.p>

        {/* SEO: descriptive keywords for search engines */}
        <p className="sr-only">
          ClassyqBraidsLuxe is a luxury hair braiding salon in London, Ontario specializing in knotless braids, box braids, goddess braids, boho braids, cornrows, tribal braids, and premium hair extensions. Book your braiding appointment online or shop our collection of human hair extensions, braiding hair, and wigs.
        </p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Link to="/book">
            <Button className="bg-gold hover:bg-gold/90 text-white text-xs uppercase tracking-[0.15em] rounded-none px-9 h-12 w-full sm:w-auto transition-all duration-300 group">
              Book Appointment
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="border-white/25 text-white hover:bg-white hover:text-onyx text-xs uppercase tracking-[0.15em] rounded-none px-9 h-12 w-full sm:w-auto transition-all duration-300">
              Shop Extensions
            </Button>
          </Link>
        </motion.div>

        {/* Stat / trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center gap-6 sm:gap-10"
        >
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-white/40 text-[0.65rem] uppercase tracking-[0.25em] font-body">
              5.0 · Client Love
            </p>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div>
            <p className="font-display text-2xl text-white font-light leading-none mb-1">30+</p>
            <p className="text-white/40 text-[0.65rem] uppercase tracking-[0.25em] font-body">
              Signature Styles
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right — Full image panel */}
      <div className="relative w-full lg:w-[54%] h-[55vh] lg:h-screen overflow-hidden">
        <img
          src={heroImage}
          alt="Luxury hair braiding salon and hair extensions studio in London, Ontario"
          className="w-full h-full object-cover"
        />
        {/* Soft blend seam where image meets the onyx panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/10 to-transparent lg:via-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent" />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-3 z-20"
      >
        <span className="text-white/40 text-[0.6rem] uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-[1px] h-10 bg-gradient-to-b from-gold via-gold/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}