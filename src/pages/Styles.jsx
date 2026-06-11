import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, DollarSign, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { value: 'all', label: 'All Styles' },
  { value: 'knotless_braids', label: 'Knotless' },
  { value: 'box_braids', label: 'Box Braids' },
  { value: 'boho_braids', label: 'Boho' },
  { value: 'goddess_braids', label: 'Goddess' },
  { value: 'cornrows', label: 'Cornrows' },
  { value: 'tribal_braids', label: 'Tribal' },
  { value: 'custom_styles', label: 'Custom' },
];

export default function Styles() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: styles = [], isLoading } = useQuery({
    queryKey: ['hairstyles'],
    queryFn: () => base44.entities.Hairstyle.list(),
  });

  const filtered = activeCategory === 'all'
    ? styles.filter(s => s.is_active !== false)
    : styles.filter(s => s.category === activeCategory && s.is_active !== false);

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Our Collection</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          Hairstyle <span className="italic">Catalog</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Browse our curated collection of premium braiding styles. Each crafted with precision and artistry.
        </p>
        <div className="hair-line w-32 mx-auto mt-6" />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-white/80 h-auto p-1 flex-nowrap">
              {categories.map(c => (
                <TabsTrigger key={c.value} value={c.value} className="text-xs uppercase tracking-wider whitespace-nowrap px-4">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No styles found in this category yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon or browse all styles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((style, idx) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <div className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {style.images?.[0] ? (
                      <img src={style.images[0]} alt={style.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                    {style.video_url && (
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-onyx ml-0.5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}