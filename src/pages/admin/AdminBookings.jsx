import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AppreciationDialog from '@/components/admin/AppreciationDialog';

export default function AdminBookings() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: (updatedBooking, { data, previousStatus }) => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      if (data.status === 'confirmed') {
        toast.success('Booking confirmed — confirmation email sent to client!');
      } else if (data.status === 'completed' && previousStatus !== 'completed') {
        toast.success('Booking marked complete — status email sent to client');
        setAppreciationBooking(updatedBooking);
      } else {
        toast.success('Booking updated — status email sent to client');
      }
    },
  });

  const [exporting, setExporting] = useState(false);
  const [exportRange, setExportRange] = useState('all');
  const [appreciationBooking, setAppreciationBooking] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke('exportBookingsToSheets', { range: exportRange });
      toast.success(`Exported ${res.data.count} bookings!`, {
        action: { label: 'Open Sheet', onClick: () => window.open(res.data.url, '_blank') },
      });
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const sizeLabels = { extra_small: 'Extra Small', small: 'Small', small_medium: 'Small-Medium', medium: 'Medium', large: 'Large', extra_large: 'Extra Large' };
  const lengthLabels = { shoulder: 'Shoulder', mid_back: 'Mid Back', waist: 'Waist', hip: 'Hip', custom: 'Custom' };
  const payColors = { unpaid: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700', refunded: 'bg-red-100 text-red-700' };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg">All Bookings</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={exportRange} onValueChange={setExportRange}>
              <SelectTrigger className="h-8 w-[110px] text-xs rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting} className="gap-2 text-xs">
              <FileSpreadsheet className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export'}
            </Button>
          </div>
        </div>
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
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {b.hair_size && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Size</p>
                          <p className="font-medium">{sizeLabels[b.hair_size] || b.hair_size}</p>
                        </div>
                      )}
                      {b.hair_length && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Length</p>
                          <p className="font-medium">{lengthLabels[b.hair_length] || b.hair_length}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                        <p className="font-medium">{b.requires_quote ? 'Quote required' : `$${(b.total_price || 0).toFixed(2)}`}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${payColors[b.payment_status] || 'bg-secondary text-muted-foreground'}`}>
                          {b.payment_status || 'unpaid'}
                        </span>
                      </div>
                    </div>
                    {b.notes && (
                      <div className="mt-2 text-xs">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Notes</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{b.notes}</p>
                      </div>
                    )}
                    {b.extension_products?.length > 0 && (
                      <div className="mt-2 text-xs">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Extensions to Purchase</p>
                        <ul className="mt-1 space-y-0.5">
                          {b.extension_products.map((p, i) => (
                            <li key={i} className="text-muted-foreground">
                              {p.product_name}
                              {p.length ? ` · ${p.length}` : ''}
                              {p.color ? ` · ${p.color}` : ''}
                              {` ×${p.quantity || 1}`}
                              {` @ $${(p.unit_price || 0).toFixed(2)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(b.inspiration_link || b.inspiration_media?.length > 0) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {b.inspiration_media?.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 border border-border rounded-sm overflow-hidden">
                            {/\.(mp4|webm|mov|ogg|avi)(\?|$)/i.test(url) ? (
                              <video src={url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                          </a>
                        ))}
                        {b.inspiration_link && (
                          <a href={b.inspiration_link} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline">
                            📎 View inspiration link →
                          </a>
                        )}
                      </div>
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
      <AppreciationDialog
        booking={appreciationBooking}
        open={!!appreciationBooking}
        onClose={() => setAppreciationBooking(null)}
      />
    </Card>
  );
}