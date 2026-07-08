import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-onyx text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div>
            <BrandLogo heightClass="h-20" className="mb-4" />
            <p className="text-sm leading-relaxed text-white/60 mb-6">
              Luxury braiding, premium hair extensions, exceptional beauty.
              Where artistry meets elegance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-medium">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'Hairstyle Catalog', path: '/styles' },
                { label: 'Book Appointment', path: '/book' },
                { label: 'Hair Extensions Shop', path: '/shop' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map(link => (
                <Link key={link.path} to={link.path} className="text-sm hover:text-gold transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-medium">Services</h4>
            <nav className="flex flex-col gap-3 text-sm">
              <span>Knotless Braids</span>
              <span>Box Braids</span>
              <span>Boho Braids</span>
              <span>Goddess Braids</span>
              <span>Cornrows</span>
              <span>Custom Styles</span>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-6 font-medium">Get in Touch</h4>
            <div className="flex flex-col gap-4 text-sm">
              <a href="tel:+14372996513" className="flex items-center gap-3 hover:text-gold transition-colors">
                <Phone className="w-4 h-4 text-gold" />
                (437) 299-6513
              </a>
              <a href="mailto:hello@classyqbraidsluxe.com" className="flex items-center gap-3 hover:text-gold transition-colors">
                <Mail className="w-4 h-4 text-gold" />
                hello@classyqbraidsluxe.com
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>London, ON</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hair-line mt-12 mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} ClassyqBraidsLuxe. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}