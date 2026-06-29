import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import ProductQuickView from '@/components/shop/ProductQuickView';

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
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const fromBooking = new URLSearchParams(window.location.search).get('from_booking') === '1';

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const filtered = products
    .filter(p => p.is_active !== false)
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  const getDisplayPrice = (product) => {
    if (product.length_prices && Object.keys(product.length_prices).length > 0) {
      return Math.min(...Object.values(product.length_prices));
    }
    return product.sale_price || product.price;
  };

  const handleCardClick = (product) => {
    const isExtension = product.product_type === 'extension';
    const hasOptions = (isExtension && product.length_prices && Object.keys(product.length_prices).length > 0) || (product.colors || []).length > 0;
    if (hasOptions) {
      setQuickViewProduct(product);
    } else {
      handleSimpleAddToCart(product);
    }
  };

  const handleSimpleAddToCart = async (product) => {
    const sessionId = localStorage.getItem('cart_session') || (() => {
      const id = 'sess_' + Date.now().toString(36);
      localStorage.setItem('cart_session', id);
      return id;
    })();
    await base44.entities.CartItem.create({
      session_id: sessionId,
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || '',
      price: product.sale_price || product.price,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Premium Collection</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          Hair Extensions <span className="italic">Shop</span>
        </h1>
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
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="group"
              >
                <div className="bg-white shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.sale_price && product.sale_price < product.price && (
                      <Badge className="absolute top-3 left-3 bg-gold text-white rounded-none text-[10px]">
                        SALE
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Button
                        onClick={() => handleCardClick(product)}
                        className="w-full bg-onyx/90 text-white hover:bg-gold text-[10px] uppercase tracking-wider rounded-none h-9 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1.5" />
                        {(product.product_type === 'extension' && product.length_prices && Object.keys(product.length_prices).length > 0) || (product.colors || []).length > 0 ? 'Select Options' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {product.category?.replace(/_/g, ' ')}
                    </p>
                    <h3 className="font-display text-base text-onyx line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {product.length_prices && Object.keys(product.length_prices).length > 0 ? 'From ' : ''}
                      </span>
                      <span className="font-medium text-gold">${getDisplayPrice(product)?.toFixed(2)}</span>
                      {!product.length_prices && product.sale_price && product.sale_price < product.price && (
                        <span className="text-xs text-muted-foreground line-through">${product.price?.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {quickViewProduct && (
        <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}