import React, { useState } from 'react';
import { dataApi } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SearchX, X } from 'lucide-react';
import PageHero from '@/components/motion/PageHero';
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

  const visibleCount = styles.filter((s) => s.is_active !== false).length;

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
      <PageHero eyebrow="Our Collection" words={['Hair', 'Braiding']} italic="Styles">
        Browse our curated collection of premium braiding styles in London, Ontario. From knotless braids and box braids to goddess braids, boho braids, cornrows, and tribal braids — each style is crafted with precision and artistry by our expert braiders.
      </PageHero>

      {/* Sticky search + filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-16 z-20 -mx-4 mb-10 border-y border-black/5 bg-beige/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border lg:top-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="group relative w-full lg:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-gold" />
              <input
                type="text"
                placeholder="Search styles by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold focus:shadow-[0_0_0_4px_rgba(157,123,28,0.12)]"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => setSearchQuery('')} aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-onyx"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-1.5">
                {categories.map((c) => {
                  const on = activeCategory === c.value;
                  const count = c.value === 'all' ? visibleCount : styles.filter((s) => s.is_active !== false && s.category === c.value).length;
                  return (
                    <motion.button
                      key={c.value}
                      onClick={() => setActiveCategory(c.value)}
                      whileTap={{ scale: 0.94 }}
                      className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${on ? 'text-white' : 'text-onyx/70 hover:text-onyx'}`}
                    >
                      {on && <motion.span layoutId="styles-cat-pill" className="absolute inset-0 rounded-full bg-onyx" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
                      <span className="relative">{c.label} <span className={`ml-0.5 tabular-nums ${on ? 'text-white/60' : 'text-muted-foreground'}`}>{count}</span></span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white ring-1 ring-black/5" style={{ animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <SearchX className="h-7 w-7 text-gold" />
            </motion.div>
            <p className="font-display text-xl text-onyx">
              {searchQuery ? `No styles match "${searchQuery}"` : 'No styles in this category yet'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term or category.' : 'Check back soon or browse all styles.'}
            </p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-5 rounded-full bg-onyx px-5 py-2.5 text-xs uppercase tracking-wider text-white transition-colors hover:bg-gold">
              Show all styles
            </button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {categories.filter(c => c.value !== 'all' && (activeCategory === 'all' || activeCategory === c.value)).map(cat => {
              const group = filtered.filter(s => s.category === cat.value);
              if (group.length === 0) return null;
              return (
                <section key={cat.value}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="mb-6 flex items-center gap-4"
                  >
                    <h2 className="font-display text-3xl text-onyx">{cat.label}</h2>
                    <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs text-gold">{group.length} styles</span>
                    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 }} className="h-px flex-1 origin-left bg-gold/30" />
                  </motion.div>
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