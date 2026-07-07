import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function Cart() {
  const qc = useQueryClient();
  const sessionId = localStorage.getItem('cart_session');
  const [showInfo, setShowInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => sessionId ? base44.entities.CartItem.filter({ session_id: sessionId }) : [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }) => base44.entities.CartItem.update(id, { quantity: qty }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.email) {
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

  if (!isLoading && items.length === 0) {
    return (
      <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-onyx mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Browse our premium hair extensions collection.</p>
          <Link to="/shop">
            <Button className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-11 px-8">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-onyx">Shopping <span className="italic">Cart</span></h1>
          <Link to="/shop" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Continue Shopping
          </Link>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <motion.div
              key={item.id}
              layout
              className="bg-white p-4 flex items-center gap-4 shadow-sm"
            >
              {item.product_image && (
                <WatermarkedImage src={item.product_image} alt={item.product_name} className="w-20 h-20 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base text-onyx truncate">{item.product_name}</h3>
                {item.selected_length && <p className="text-xs text-muted-foreground">{item.selected_length}</p>}
                <p className="text-sm font-medium text-gold mt-1">${item.price?.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => item.quantity > 1 && updateMutation.mutate({ id: item.id, qty: item.quantity - 1 })}
                  className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm w-6 text-center font-medium">{item.quantity || 1}</span>
                <button
                  onClick={() => updateMutation.mutate({ id: item.id, qty: (item.quantity || 1) + 1 })}
                  className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary + Customer Info */}
        <div className="bg-white p-6 shadow-sm mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-display text-2xl text-onyx">${total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Shipping calculated at checkout</p>

          {showInfo ? (
            <div className="space-y-3 mb-4 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Your Details</p>
              <div>
                <Label className="text-xs uppercase tracking-wider">Full Name *</Label>
                <Input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="mt-1 rounded-none h-10" placeholder="Your full name" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Email *</Label>
                <Input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="mt-1 rounded-none h-10" placeholder="your@email.com" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Phone</Label>
                <Input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="mt-1 rounded-none h-10" placeholder="(123) 456-7890" />
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gold text-white hover:bg-gold/90 rounded-none text-xs uppercase tracking-wider h-12 mt-2"
              >
                <>Pay Securely <ArrowRight className="w-3.5 h-3.5 ml-2" /></>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowInfo(true)}
              className="w-full bg-gold text-white hover:bg-gold/90 rounded-none text-xs uppercase tracking-wider h-12 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}