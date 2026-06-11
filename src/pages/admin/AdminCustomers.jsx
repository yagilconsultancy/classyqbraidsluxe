import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminCustomers() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings-customers'],
    queryFn: () => base44.entities.Booking.list(),
  });

  // Unique customers from bookings
  const customers = {};
  bookings.forEach(b => {
    if (b.customer_email && !customers[b.customer_email]) {
      customers[b.customer_email] = {
        name: b.customer_name,
        email: b.customer_email,
        phone: b.customer_phone,
        bookings: 0,
      };
    }
    if (b.customer_email) customers[b.customer_email].bookings++;
  });
  const customerList = Object.values(customers);

  return (
    <Card className="shadow-sm border-border">
      <CardHeader><CardTitle className="font-display text-lg">Customers</CardTitle></CardHeader>
      <CardContent>
        {customerList.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No customers yet. Customers are created from bookings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customerList.map((c, i) => (
              <div key={i} className="p-4 bg-secondary/30 border border-border rounded-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.phone}</p>
                </div>
                <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-sm">{c.bookings} booking{c.bookings > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}