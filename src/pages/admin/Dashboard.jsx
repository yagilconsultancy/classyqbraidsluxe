import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: () => base44.entities.Booking.list() });
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: () => base44.entities.Order.list() });
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list() });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.appointment_date === today);
  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_price || 0), 0) +
    orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total || 0), 0);
  const upcoming = bookings.filter(b => b.appointment_date >= today && b.status !== 'cancelled');

  const stats = [
    { icon: Calendar, label: 'Today\'s Bookings', value: todayBookings.length, color: 'text-gold' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, color: 'text-green-600' },
    { icon: TrendingUp, label: 'Upcoming', value: upcoming.length, color: 'text-blue-600' },
    { icon: Package, label: 'Products', value: products.length, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="shadow-sm border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-display font-semibold mt-2 text-onyx">{s.value}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-sm">
                  <div>
                    <p className="font-medium text-sm">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.hairstyle_name} · {b.appointment_date} at {b.appointment_time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-sm uppercase tracking-wider font-medium ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}