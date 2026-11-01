import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HairstyleImageHover from '@/components/styles/HairstyleImageHover';

export default function StyleCard({ style, idx, onOpenGallery }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 6) * 0.05 }}
      className="group"
    >
      <div className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => style.images?.length > 0 && onOpenGallery(style.images)}>
          <HairstyleImageHover images={style.images || []} alt={style.name} />
          {style.images?.length > 1 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
              <Images className="w-3 h-3" />
              {style.images.length}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500" onClick={e => e.stopPropagation()}>
            {style.description && (
              <p className="text-white/90 text-sm leading-relaxed mb-3 line-clamp-4">{style.description}</p>
            )}
            <Link to={`/book?style=${style.id}`}>
              <Button className="w-full bg-gold hover:bg-gold/90 text-white text-xs uppercase tracking-wider rounded-none h-10">
                Book This Style
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl text-onyx">{style.name}</h3>
          {style.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{style.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm font-medium text-gold">
              <DollarSign className="w-3.5 h-3.5" />
              From ${style.starting_price}
            </span>
            {style.estimated_duration && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {style.estimated_duration}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}