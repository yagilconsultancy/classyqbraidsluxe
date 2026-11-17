import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scissors, Calendar, Package, ShoppingCart, Users, Settings, ChevronLeft, Menu, LogOut, Lock } from 'lucide-react';
import { useClerk } from '@clerk/react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminClient';
import BrandLogo from '@/components/BrandLogo';

const navGroups = [
  { items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/admin' }] },
  { title: 'Operations', items: [
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings', badge: 'pending_bookings' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', badge: 'pending_orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Settings, label: 'Availability', path: '/admin/availability' },
  ] },
  { title: 'Catalog', items: [
    { icon: Scissors, label: 'Hairstyles', path: '/admin/styles' },
    { icon: Package, label: 'Products', path: '/admin/products', badge: 'low_stock_products' },
  ] },
  { title: 'Account', items: [{ icon: Lock, label: 'Account & Security', path: '/admin/team' }] },
];
const navItems = navGroups.flatMap((g) => g.items);

function SidebarContent({ location, onItemClick }) {
  const { signOut } = useClerk();
  const { data } = useQuery({ queryKey: ['admin-analytics'], queryFn: () => adminApi.analytics.get(), refetchInterval: 60000 });
  const kpis = data?.kpis || {};
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link to="/">
          <BrandLogo heightClass="h-14" />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">Admin Panel</p>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {navGroups.map((g, gi) => (
          <div key={gi} className="space-y-1">
            {g.title && <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">{g.title}</p>}
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              const count = item.badge ? kpis[item.badge] : 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-md ${
                    active ? 'bg-gold/10 text-gold font-medium' : 'text-muted-foreground hover:text-onyx hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-gold text-white text-[10px] font-medium flex items-center justify-center tabular-nums">{count}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-2">
        <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors">
          <ChevronLeft className="w-3 h-3" />
          Back to Website
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: '/login' })}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-beige">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 bg-white border-r border-border shrink-0">
        <SidebarContent location={location} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-white">
          <SidebarContent location={location} onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center px-4 lg:px-6 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1 mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg text-onyx">
            {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}