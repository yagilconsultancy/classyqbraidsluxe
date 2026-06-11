import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBookBar from './MobileBookBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBookBar />
    </div>
  );
}