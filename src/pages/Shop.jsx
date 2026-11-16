import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, PackageSearch, Search, X } from 'lucide-react';
import { dataApi } from '@/api/dataClient';
import ProductCard from '@/components/shop/ProductCard';
import TermsModal, { hasAcceptedTerms } from '@/components/TermsModal';

const EASE = [0.22, 1, 0.36, 1];
const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

const startingPrice = (p) =>
  p.length_prices && Object.keys(p.length_prices).length
    ? Math.min(...Object.values(p.length_prices))
    : (p.sale_price || p.price || 0);
const pretty = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function Orb({ className, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      animate={reduce ? undefined : { y: [0, -24, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function Shop() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [termsOpen, setTermsOpen] = useState(false);
  const fromBooking = new URLSearchParams(window.location.search).get('from_booking') === '1';

  useEffect(() => {
    if (!hasAcceptedTerms()) setTermsOpen(true);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => dataApi.products.list(),
  });

  const active = useMemo(() => products.filter((p) => p.is_active !== false), [products]);

  // Categories come from the real catalogue, with counts, so a chip never leads to an empty page.
  const categories = useMemo(() => {
    const counts = new Map();
    active.forEach((p) => p.category && counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [{ value: 'all', label: 'All', count: active.length }, ...[...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: pretty(value), count }))];
  }, [active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = active
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    const sorted = [...list];
    if (sort === 'price_asc') sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === 'price_desc') sorted.sort((a, b) => startingPrice(b) - startingPrice(a));
    if (sort === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sort === 'featured') sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return sorted;
  }, [active, category, search, sort]);

  if (!hasAcceptedTerms()) {
    return (
      <div className="pt-20 lg:pt-24 bg-beige min-h-screen">
        <TermsModal
          open={termsOpen}
          context="shop"
          onAgree={() => setTermsOpen(false)}
          onDecline={() => { window.location.href = '/'; }}
        />
      </div>
    );
  }

  const headline = ['Hair', 'Extensions'];

  return (
    <div className="min-h-screen bg-beige pt-20 pb-24 lg:pt-24 lg:pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <Orb className="-left-24 top-0 h-72 w-72 bg-gold/20" />
        <Orb className="-right-20 top-20 h-64 w-64 bg-amber-200/40" delay={2} />
        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.3em' }}
            transition={{ duration: 1, ease: EASE }}
            className="text-xs font-medium uppercase text-gold"
          >
            Premium Collection
          </motion.span>
          <h1 className="mt-3 font-display text-4xl font-light text-onyx lg:text-6xl">
            {headline.map((w, i) => (
              <span key={w} className="mr-3 inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: EASE }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block italic"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              >
                Shop
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            className="mx-auto mt-4 max-w-xl text-muted-foreground"
          >
            Shop premium hair extensions, braiding hair, lace front wigs, closure wigs, and curly hair bundles. Quality products for lasting, beautiful results — available online with easy checkout.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
            className="hair-line mx-auto mt-6 w-32 origin-center"
          />
          {fromBooking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 inline-block rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3 text-sm text-onyx"
            >
              <span className="font-medium">You're shopping as part of your booking.</span> Add your extensions to cart, then{' '}
              <Link to="/book?booking_return=1" className="group inline-flex items-center gap-1 font-semibold text-gold underline">
                return to complete your appointment
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sticky filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
          className="sticky top-16 z-20 -mx-4 mb-8 border-y border-black/5 bg-beige/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-4 lg:top-20"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="group relative w-full lg:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-gold" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold focus:shadow-[0_0_0_4px_rgba(157,123,28,0.12)]"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-onyx"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="-mx-4 flex-1 overflow-x-auto px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-1.5">
                {categories.map((c) => {
                  const on = category === c.value;
                  return (
                    <motion.button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      whileTap={{ scale: 0.94 }}
                      className={`relative whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${on ? 'text-white' : 'text-onyx/70 hover:text-onyx'}`}
                    >
                      {on && (
                        <motion.span
                          layoutId="shop-cat-pill"
                          className="absolute inset-0 rounded-full bg-onyx"
                          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        />
                      )}
                      <span className="relative">
                        {c.label} <span className={`ml-0.5 tabular-nums ${on ? 'text-white/60' : 'text-muted-foreground'}`}>{c.count}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="h-11 rounded-full border border-border bg-white px-4 text-xs outline-none transition-shadow focus:border-gold focus:shadow-[0_0_0_4px_rgba(157,123,28,0.12)]"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </motion.div>

        {!isLoading && (
          <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
            Showing <span className="font-medium text-onyx tabular-nums">{filtered.length}</span> product{filtered.length === 1 ? '' : 's'}
            {category !== 'all' && <> in <span className="text-onyx">{pretty(category)}</span></>}
            {search && <> matching “{search}”</>}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                <div className="aspect-square animate-pulse bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
                <div className="space-y-2 p-4">
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <PackageSearch className="h-7 w-7 text-gold" />
            </motion.div>
            <p className="font-display text-xl text-onyx">Nothing matches that yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="mt-5 rounded-full bg-onyx px-5 py-2.5 text-xs uppercase tracking-wider text-white transition-colors hover:bg-gold">
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex"
                >
                  <div className="flex flex-1"><ProductCard product={product} index={idx} /></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
