import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Styles', path: '/styles' },
  { label: 'Book Now', path: '/book' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar({ cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
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
            <span className="font-display text-xl lg:text-2xl font-semibold tracking-wide text-onyx">
              Classyq<span className="text-gold">Braids</span>Luxe
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors hover:text-gold ${
                  location.pathname === link.path ? 'text-gold' : 'text-onyx'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/shop/cart" className="relative p-2 hover:text-gold transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/login" className="hidden lg:block p-2 hover:text-gold transition-colors">
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
                <button className="p-2">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-80 p-0">
                <div className="flex flex-col h-full pt-16 px-8">
                  <div className="font-display text-xl font-semibold mb-10">
                    Classyq<span className="text-gold">Braids</span>Luxe
                  </div>
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