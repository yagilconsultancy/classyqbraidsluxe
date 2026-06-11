import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-beige">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Ready?</span>
          <h2 className="font-display text-3xl lg:text-5xl font-light text-onyx mt-3 mb-6">
            Your <span className="italic">Transformation</span> Awaits
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Book your appointment today and experience the luxury of ClassyqBraidsLuxe. No account needed — just choose your style and we handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button className="bg-onyx text-white hover:bg-gold text-xs uppercase tracking-[0.15em] rounded-none px-10 h-12 transition-all duration-300 group">
                Book Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="border-onyx text-onyx hover:bg-onyx hover:text-white text-xs uppercase tracking-[0.15em] rounded-none px-10 h-12 transition-all duration-300">
                Browse Shop
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}