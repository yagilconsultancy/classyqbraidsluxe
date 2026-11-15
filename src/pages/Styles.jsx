import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataApi } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Images, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageGalleryModal from '@/components/styles/ImageGalleryModal';
import StyleCard from '@/components/styles/StyleCard';

const categories = [
  { value: 'all', label: 'All Styles' },
  { value: 'braids', label: 'Braids' },
  { value: 'corn_rows', label: 'Corn Rows' },
  { value: 'locs', label: 'Locs' },
];

export default function Styles() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gallery, setGallery] = useState(null); // { images, index }

  const { data: styles = [], isLoading } = useQuery({
    queryKey: ['hairstyles'],
    queryFn: () => dataApi.hairstyles.list(),
  });

  const filtered = styles.filter(s => {
    if (s.is_active === false) return false;
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q));
  });

  // Order All Styles: braids → corn_rows → locs, preserving sort_order within each
  if (activeCategory === 'all') {
    const order = { braids: 0, corn_rows: 1, locs: 2 };
    filtered.sort((a, b) =>
      (order[a.category] ?? 9) - (order[b.category] ?? 9) ||
      (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Our Collection</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          Hair Braiding <span className="italic">Styles</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Browse our curated collection of premium braiding styles in London, Ontario. From knotless braids and box braids to goddess braids, boho braids, cornrows, and tribal braids — each style is crafted with precision and artistry by our expert braiders.
        </p>
        <div className="hair-line w-32 mx-auto mt-6" />
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search styles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/80 border-border rounded-none h-11"
          />
        </div>
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
            <p className="text-muted-foreground">
              {searchQuery ? `No styles match "${searchQuery}".` : 'No styles found in this category yet.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery ? 'Try a different search term or category.' : 'Check back soon or browse all styles.'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.filter(c => c.value !== 'all' && (activeCategory === 'all' || activeCategory === c.value)).map(cat => {
              const group = filtered.filter(s => s.category === cat.value);
              if (group.length === 0) return null;
              return (
                <section key={cat.value}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display text-3xl text-onyx">{cat.label}</h2>
                    <span className="text-xs text-muted-foreground">{group.length} styles</span>
                    <div className="flex-1 h-px bg-gold/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {group.map((style, idx) => (
                      <StyleCard key={style.id} style={style} idx={idx} onOpenGallery={images => setGallery({ images, index: 0 })} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      {gallery && (
        <ImageGalleryModal
          images={gallery.images}
          initialIndex={gallery.index}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}