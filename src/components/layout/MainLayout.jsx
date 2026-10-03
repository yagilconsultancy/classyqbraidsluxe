import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from './SectionReveal';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBookBar from './MobileBookBar';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      <main className="flex-1">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <SectionReveal />
      <Footer />
      <MobileBookBar />
      <FloatingWhatsApp />
    </div>
  );
}