import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { adminApi } from '@/api/adminClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadCsv } from '@/lib/csv';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.customers.list(),
  });

  const q = search.trim().toLowerCase();
  const visible = customers.filter((c) => !q || [c.name, c.email, c.phone].some((v) => (v || '').toLowerCase().includes(q)));
  const repeat = customers.filter((c) => c.bookings + c.orders > 1).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {customers.length} customer{customers.length === 1 ? '' : 's'} · {repeat} returning
        </p>
        <div className="flex gap-2 sm:ml-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone…" className="pl-9 h-9 bg-white" />
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs bg-white" disabled={!visible.length}
            onClick={() => downloadCsv('customers.csv', visible.map((c) => ({ name: c.name, email: c.email, phone: c.phone, bookings: c.bookings, orders: c.orders, spent: c.spent.toFixed(2), last_activity: c.last_activity })))}>
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive text-center py-8">Couldn't load customers: {error.message}</p>
      ) : isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{q ? 'No customers match.' : 'No customers yet. They appear automatically from bookings and orders.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg divide-y divide-border">
          {visible.map((c) => (
            <div key={c.email} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-gold break-all"><Mail className="w-3 h-3" />{c.email}</a>
                  {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-gold"><Phone className="w-3 h-3" />{c.phone}</a>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="bg-gold/10 text-gold px-2 py-1 rounded-sm">{c.bookings} booking{c.bookings === 1 ? '' : 's'}</span>
                <span className="bg-secondary px-2 py-1 rounded-sm">{c.orders} order{c.orders === 1 ? '' : 's'}</span>
                <span className="font-medium tabular-nums w-20 text-right">${Math.round(c.spent).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
