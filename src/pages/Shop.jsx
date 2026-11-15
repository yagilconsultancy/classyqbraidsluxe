import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataApi } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/shop/ProductCard';
import TermsModal, { hasAcceptedTerms } from '@/components/TermsModal';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'braiding_hair', label: 'Braiding Hair' },
  { value: 'human_hair_bundles', label: 'Hair Bundles' },
  { value: 'lace_front_wigs', label: 'Lace Fronts' },
  { value: 'closure_wigs', label: 'Closure Wigs' },
  { value: 'curly_hair', label: 'Curly Hair' },
  { value: 'accessories', label: 'Accessories' },
];

export default function Shop() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [termsOpen, setTermsOpen] = useState(false);
  const fromBooking = new URLSearchParams(window.location.search).get('from_booking') === '1';

  useEffect(() => {
    if (!hasAcceptedTerms()) setTermsOpen(true);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => dataApi.products.list(),
  });

  const filtered = products
    .filter(p => p.is_active !== false)
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

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

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Premium Collection</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          Hair Extensions <span className="italic">Shop</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Shop premium hair extensions, braiding hair, lace front wigs, closure wigs, and curly hair bundles. Quality products for lasting, beautiful results — available online with easy checkout.
        </p>
        <div className="hair-line w-32 mx-auto mt-6" />
        {fromBooking && (
          <div className="mt-6 bg-gold/10 border border-gold/30 inline-block px-5 py-3 text-sm text-onyx">
            <span className="font-medium">You're shopping as part of your booking.</span> Add your extensions to cart, then{' '}
            <Link to="/book?booking_return=1" className="underline text-gold font-semibold">return to complete your appointment →</Link>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 rounded-none h-11 border-border"
            />
          </div>
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="bg-white/80 h-auto p-1 flex-nowrap">
                {categories.map(c => (
                  <TabsTrigger key={c.value} value={c.value} className="text-xs uppercase tracking-wider whitespace-nowrap px-3">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white aspect-square animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}