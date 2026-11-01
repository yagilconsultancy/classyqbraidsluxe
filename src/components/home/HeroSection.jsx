import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen w-full bg-onyx overflow-hidden flex flex-col lg:flex-row">
      {/* Mobile background image */}
      <div className="lg:hidden absolute inset-0 z-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/50 via-onyx/60 to-onyx" />
      </div>

      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gold/8 blur-[120px]" />

      {/* Left — Text */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[55%] px-6 sm:px-12 lg:pl-20 lg:pr-12 py-20 lg:py-0 min-h-[70vh] lg:min-h-screen">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3 mb-8">
          <span className="block w-8 h-px bg-gold" />
          <span className="text-gold/90 text-[0.6rem] uppercase tracking-[0.4em] font-medium font-body">London · Ontario</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }} className="font-display text-white leading-[1.02] mb-7 text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
          Braid, <span className="italic text-gold">beautifully.</span>
          <br />
          Extensions to match.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.26 }} className="text-white/55 text-sm lg:text-[0.95rem] font-body max-w-xl mb-9 leading-relaxed font-light">
          An atelier of braiding and curated hair extensions in London, Ontario — where artistry, texture, and care meet in every strand.
        </motion.p>

        <p className="sr-only">
          ClassyqBraidsLuxe is a luxury hair braiding salon in London, Ontario specializing in knotless braids, box braids, goddess braids, boho braids, cornrows, tribal braids, and premium hair extensions. Book your braiding appointment online or shop our collection of human hair extensions, braiding hair, and wigs.
        </p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.38 }} className="mb-12 flex flex-col sm:flex-row gap-4">
          <Link to="/book">
            <Button className="bg-gold hover:bg-gold/90 text-white text-xs uppercase tracking-[0.15em] rounded-full px-10 h-12 w-full sm:w-auto transition-all duration-300 group">
              Book Appointment
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="border-white/25 text-white hover:bg-white hover:text-onyx text-xs uppercase tracking-[0.15em] rounded-full px-10 h-12 w-full sm:w-auto transition-all duration-300">
              Shop Extensions
            </Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.52 }} className="grid grid-cols-3 gap-3 sm:gap-5 max-w-xl">
          {[
            { num: '300+', label: 'Happy Clients' },
            { num: '30+', label: 'Signature Styles' },
            { num: '5.0', label: 'Client Rating' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl px-3 sm:px-5 py-4 backdrop-blur-sm">
              <p className="font-display text-2xl sm:text-3xl text-white font-light leading-none mb-1.5">{s.num}</p>
              <p className="text-white/45 text-[0.6rem] uppercase tracking-[0.18em] font-body">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Static image (desktop) */}
      <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1 }} className="hidden lg:block absolute inset-y-0 right-0 w-[62%] z-0">
        <img src={heroImage} alt="Luxury braided hairstyle by ClassyqBraidsLuxe" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/70 via-35% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-onyx/30" />
      </motion.div>
    </section>
  );
}