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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-gold text-xs uppercase tracking-[0.3em] font-medium mb-6">
              Premium Hair Studio
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl text-white font-light leading-[1.1] mb-6"
          >
            Luxury Braiding,<br />
            <span className="italic text-gold">Premium</span> Hair<br />
            Extensions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/60 text-base lg:text-lg font-body max-w-md mb-10 leading-relaxed"
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
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gold to-transparent" />
      </motion.div>
    </section>
  );
}