import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scissors, Calendar, ShoppingBag, User } from 'lucide-react';

const tabs = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Scissors, label: 'Styles', path: '/styles' },
  { icon: Calendar, label: 'Book', path: '/book', primary: true },
  { icon: ShoppingBag, label: 'Shop', path: '/shop' },
  { icon: User, label: 'Account', path: '/login' },
];

export default function MobileBookBar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          if (tab.primary) {
            return (
              <Link key={tab.path} to={tab.path} className="flex flex-col items-center -mt-5">
                <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-gold">{tab.label}</span>
              </Link>
            );
          }
          return (
            <Link key={tab.path} to={tab.path} className="flex flex-col items-center gap-0.5">
              <Icon className={`w-5 h-5 ${active ? 'text-gold' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${active ? 'text-gold font-medium' : 'text-muted-foreground'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}