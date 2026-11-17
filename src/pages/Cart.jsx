import React, { useState } from 'react';
import { dataApi } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function Cart() {
  const qc = useQueryClient();
  const sessionId = localStorage.getItem('cart_session');
  const [showInfo, setShowInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [touched, setTouched] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => sessionId ? dataApi.cartItems.filter({ session_id: sessionId }) : [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataApi.cartItems.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }) => dataApi.cartItems.update(id, { quantity: qty }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.email) {
      setTouched(true);
      toast.error('Please fill in your name and email.');
      return;
    }
    sessionStorage.setItem('payment_pending', JSON.stringify({
      items: items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        price: i.price,
        quantity: i.quantity || 1,
        selected_length: i.selected_length,
        selected_color: i.selected_color,
      })),
      customerInfo,
    }));
    sessionStorage.setItem('payment_type', 'order');
    window.location.href = '/payment-proof';
  };

  const EASE = [0.22, 1, 0.36, 1];
  const itemCount = items.reduce((n, i) => n + (i.quantity || 1), 0);
  const field = 'mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition-shadow focus:border-gold focus:shadow-[0_0_0_4px_rgba(157,123,28,0.12)]';

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige pb-24 pt-20 lg:pb-16 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="px-4 text-center">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gold/10"
          >
            <ShoppingBag className="h-10 w-10 text-gold" />
          </motion.div>
          <h2 className="mb-2 font-display text-3xl text-onyx">Your cart is empty</h2>
          <p className="mb-7 text-muted-foreground">Browse our premium hair extensions collection.</p>
          <Link to="/shop" className="group inline-flex h-12 items-center gap-2 rounded-full bg-onyx px-8 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-all hover:bg-gold active:scale-95">
            Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige pb-24 pt-20 lg:pb-16 lg:pt-24">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-onyx lg:text-4xl">Shopping <span className="italic">Cart</span></h1>
            <p className="mt-1 text-sm text-muted-foreground">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-gold">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Continue shopping
          </Link>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, transition: { duration: 0.35 } }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg hover:shadow-black/5"
                >
                  {item.product_image && (
                    <WatermarkedImage src={item.product_image} alt={item.product_name} className="h-20 w-20 shrink-0 rounded-xl" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base text-onyx">{item.product_name}</h3>
                    {(item.selected_length || item.selected_color) && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {item.selected_length && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{item.selected_length}</span>}
                        {item.selected_color && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{item.selected_color}</span>}
                      </div>
                    )}
                    <p className="mt-1.5 text-sm font-medium text-gold">${item.price?.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-border p-1">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => item.quantity > 1 && updateMutation.mutate({ id: item.id, qty: item.quantity - 1 })}
                      disabled={(item.quantity || 1) <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-secondary disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </motion.button>
                    <span className="relative flex h-7 w-6 items-center justify-center overflow-hidden text-sm font-medium tabular-nums">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={item.quantity || 1} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }}>
                          {item.quantity || 1}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateMutation.mutate({ id: item.id, qty: (item.quantity || 1) + 1 })}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-secondary"
                    >
                      <Plus className="h-3 w-3" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => deleteMutation.mutate(item.id)}
                    aria-label={`Remove ${item.product_name}`}
                    className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary + customer info */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-28"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Order summary</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={total} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="font-display text-3xl text-onyx tabular-nums">
                  ${total.toFixed(2)}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mb-5 mt-1 text-xs text-muted-foreground">Shipping calculated at checkout</p>

            <AnimatePresence initial={false} mode="wait">
              {showInfo ? (
                <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Your details</p>
                    <label className="block text-xs uppercase tracking-wider">
                      Full name *
                      <input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Your full name" className={`${field} ${touched && !customerInfo.name ? 'border-red-400' : 'border-border'}`} />
                    </label>
                    <label className="block text-xs uppercase tracking-wider">
                      Email *
                      <input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} placeholder="your@email.com" className={`${field} ${touched && !customerInfo.email ? 'border-red-400' : 'border-border'}`} />
                    </label>
                    <label className="block text-xs uppercase tracking-wider">
                      Phone
                      <input type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="(123) 456-7890" className={`${field} border-border`} />
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCheckout}
                      className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-[11px] font-medium uppercase tracking-[0.14em] text-white"
                    >
                      <Lock className="h-3.5 w-3.5" /> Pay securely
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="cta"
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowInfo(true)}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-[11px] font-medium uppercase tracking-[0.14em] text-white"
                >
                  Proceed to checkout
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
