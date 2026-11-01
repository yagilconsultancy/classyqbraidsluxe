import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen w-full bg-onyx overflow-hidden flex flex-col lg:flex-row">
      {/* Background video */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <video
          src="https://media.base44.com/videos/public/6a2a0afc90f70c12878fb656/3f4b36f73_Hero_Video.mp4"
          poster={heroImage}
          autoPlay muted loop playsInline
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx/90 via-onyx/70 to-onyx/40" />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gold/8 blur-[120px]" />

      {/* Patterned texture — extends right and ends just before the image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(157,123,28,0.22) 1px, transparent 0), repeating-linear-gradient(115deg, rgba(157,123,28,0.05) 0px, rgba(157,123,28,0.05) 1px, transparent 1px, transparent 10px)',
          backgroundSize: '20px 20px, 100% 100%',
          WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 54%, rgba(0,0,0,0.55) 62%, transparent 70%)',
          maskImage: 'linear-gradient(to right, #000 0%, #000 54%, rgba(0,0,0,0.55) 62%, transparent 70%)',
        }}
      />

      {/* Left — Text + stats */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[48%] px-6 sm:px-12 lg:pl-20 lg:pr-12 py-20 lg:py-0 min-h-[58vh] lg:min-h-screen">
        {/* Top eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="block w-8 h-px bg-gold" />
          <span className="text-gold/90 text-[0.6rem] uppercase tracking-[0.4em] font-medium font-body">
            London · Ontario
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="font-display text-white leading-[1.02] mb-7 text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight"
        >
          Braid, <span className="italic text-gold">beautifully.</span>
          <br />
          Extensions to match.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.26 }}
          className="text-white/55 text-sm lg:text-[0.95rem] font-body max-w-md mb-9 leading-relaxed font-light"
        >
          An atelier of braiding and curated hair extensions in London, Ontario — where artistry, texture, and care meet in every strand.
        </motion.p>

        {/* SEO */}
        <p className="sr-only">
          ClassyqBraidsLuxe is a luxury hair braiding salon in London, Ontario specializing in knotless braids, box braids, goddess braids, boho braids, cornrows, tribal braids, and premium hair extensions. Book your braiding appointment online or shop our collection of human hair extensions, braiding hair, and wigs.
        </p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4">
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
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.52 }}
          className="grid grid-cols-3 gap-3 sm:gap-5 max-w-md"
        >
          {[
            { num: '300+', label: 'Happy Clients' },
            { num: '30+', label: 'Signature Styles' },
            { num: '5.0', label: 'Client Rating' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.04] border border-white/10 rounded-2xl px-3 sm:px-5 py-4 backdrop-blur-sm"
            >
              <p className="font-display text-2xl sm:text-3xl text-white font-light leading-none mb-1.5">
                {s.num}
              </p>
              <p className="text-white/45 text-[0.6rem] uppercase tracking-[0.18em] font-body">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile — image as background behind text */}
      <div className="lg:hidden absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-onyx/50 via-onyx/50 to-onyx" />

    </section>
  );
}