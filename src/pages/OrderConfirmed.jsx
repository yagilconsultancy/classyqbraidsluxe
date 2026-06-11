import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmed() {
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get('order_number');
    if (num) setOrderNumber(num);
    // Clear cart session
    localStorage.removeItem('cart_session');
  }, []);

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-gold" />
        </div>
        <h1 className="font-display text-3xl text-onyx mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        {orderNumber && (
          <div className="bg-white p-4 shadow-sm mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
            <p className="font-mono font-semibold text-gold text-lg">{orderNumber}</p>
          </div>
        )}
        <Button onClick={() => window.location.href = '/shop'} className="bg-onyx text-white hover:bg-gold text-xs uppercase tracking-wider rounded-none h-11 px-8">
          Continue Shopping
        </Button>
      </motion.div>
    </div>
  );
}