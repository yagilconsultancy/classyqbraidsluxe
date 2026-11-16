import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';
import { useQuery } from '@tanstack/react-query';
import { dataApi } from '@/api/dataClient';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Styles', path: '/styles' },
  { label: 'Book Now', path: '/book' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const readSession = () => { try { return localStorage.getItem('cart_session') || ''; } catch { return ''; } };
  const [sessionId, setSessionId] = useState(readSession);
  // A first add-to-cart creates the session id; pick it up without a reload.
  useEffect(() => {
    const sync = () => setSessionId(readSession());
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => dataApi.cartItems.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });
  const cartCount = cartItems.reduce((n, i) => n + (i.quantity || 1), 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BrandLogo heightClass="h-12 lg:h-14" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors hover:text-gold ${
                  location.pathname === link.path ? 'text-gold' : scrolled ? 'text-onyx' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/shop/cart" className={`relative p-2 hover:text-gold transition-colors ${scrolled ? 'text-onyx' : 'text-white'}`}>
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [1.5, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                    className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-semibold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Link to="/login" className={`hidden lg:block p-2 hover:text-gold transition-colors ${scrolled ? 'text-onyx' : 'text-white'}`}>
              <User className="w-5 h-5" />
            </Link>
            <Link to="/book" className="hidden lg:block">
              <Button className="bg-onyx text-white hover:bg-gold text-xs uppercase tracking-[0.1em] rounded-none px-6 h-9 transition-all duration-300">
                Book Now
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className={`p-2 ${scrolled ? 'text-onyx' : 'text-white'}`}>
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-80 p-0">
                <div className="flex flex-col h-full pt-16 px-8">
                  <BrandLogo heightClass="h-16" className="mb-10" />
                  <nav className="flex flex-col gap-6">
                    {navLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`text-sm uppercase tracking-[0.15em] font-medium transition-colors hover:text-gold ${
                          location.pathname === link.path ? 'text-gold' : 'text-onyx'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto pb-8">
                    <Link to="/book" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-onyx text-white hover:bg-gold text-xs uppercase tracking-[0.1em] rounded-none h-12 transition-all duration-300">
                        Book Appointment
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block mt-4 text-center text-sm text-muted-foreground hover:text-gold">
                      Sign In / Register
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}