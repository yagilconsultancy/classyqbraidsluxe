import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Images } from 'lucide-react';
import HairstyleImageHover from '@/components/styles/HairstyleImageHover';

const EASE = [0.22, 1, 0.36, 1];

export default function StyleCard({ style, idx, onOpenGallery }) {
  const count = style.images?.length || 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (idx % 3) * 0.08, duration: 0.65, ease: EASE }}
      whileHover={{ y: -8 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/10"
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden ${count ? 'cursor-zoom-in' : ''}`}
        onClick={() => count > 0 && onOpenGallery(style.images)}
      >
        <HairstyleImageHover images={style.images || []} alt={style.name} />

        {count > 1 && (
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur"
          >
            <Images className="h-3 w-3" />
            {count}
          </motion.div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div
          className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {style.description && <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-white/90">{style.description}</p>}
          <Link
            to={`/book?style=${style.id}`}
            className="group/btn flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gold text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          >
            Book this style
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
          </Link>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-onyx transition-colors duration-300 group-hover:text-gold">{style.name}</h3>
        {style.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{style.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
            From ${style.starting_price}
          </span>
          {style.estimated_duration && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {style.estimated_duration}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
