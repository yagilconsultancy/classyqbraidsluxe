import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FeaturedStyles({ styles }) {
  return (
    <section className="py-20 lg:py-28 bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Our Signature</span>
          <h2 className="font-display text-3xl lg:text-5xl font-light text-onyx mt-3">
            Popular <span className="italic">Hairstyles</span>
          </h2>
          <div className="hair-line w-32 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {styles.map((style, index) => (
            <motion.div
              key={style.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to="/styles" className="group block">
                <div className="relative overflow-hidden bg-white aspect-[3/4]">
                  {style.images?.[0] ? (
                    <img
                      src={style.images[0]}
                      alt={style.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-white text-xs uppercase tracking-[0.15em] flex items-center gap-2">
                      View Style <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <div className="pt-4 pb-2">
                  <h3 className="font-display text-xl text-onyx">{style.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">From ${style.starting_price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/styles" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-onyx hover:text-gold transition-colors font-medium group">
            View All Styles
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}