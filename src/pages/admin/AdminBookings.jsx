import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminBookings() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, previousStatus }) => {
      await base44.entities.Booking.update(id, data);
      // Send confirmation email only when status changes to 'confirmed'
      if (data.status === 'confirmed' && previousStatus !== 'confirmed') {
        await base44.functions.invoke('sendBookingConfirmation', { bookingId: id });
      }
    },
    onSuccess: (_, { data }) => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      if (data.status === 'confirmed') {
        toast.success('Booking confirmed — confirmation email sent to client!');
      } else {
        toast.success('Booking updated');
      }
    },
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="font-display text-lg">All Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-sm" />)}</div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="p-4 bg-secondary/30 border border-border rounded-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.customer_name}</span>
                      <span className="text-xs font-mono text-gold">{b.reference_number}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {b.hairstyle_name} · {b.appointment_date} at {b.appointment_time}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.customer_email} · {b.customer_phone}</p>
                    {b.extension_source && (
                      <p className="text-xs mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${b.extension_source === 'buy_from_us' ? 'bg-gold/10 text-yellow-700' : 'bg-secondary text-muted-foreground'}`}>
                          {b.extension_source === 'buy_from_us' ? '💛 Purchasing extensions from us' : '✂️ Bringing own extensions'}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={b.status}
                      onValueChange={(val) => updateMutation.mutate({ id: b.id, data: { status: val }, previousStatus: b.status })}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}