import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Package, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); },
  });

  const shipMutation = useMutation({
    mutationFn: ({ id }) => base44.functions.invoke('shipOrder', { order_id: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Order shipped & inventory updated');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to ship order'),
  });

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'shipped') {
      shipMutation.mutate({ id: order.id });
    } else {
      updateMutation.mutate({ id: order.id, data: { status: newStatus } });
    }
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader><CardTitle className="font-display text-lg">All Orders</CardTitle></CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const isOpen = expanded === o.id;
              return (
                <div key={o.id} className="bg-secondary/30 border border-border rounded-sm overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{o.customer_name}</span>
                        <span className="text-xs font-mono text-gold">{o.order_number}</span>
                        <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>
                          {o.status}
                        </span>
                        <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {o.payment_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {o.items?.length || 0} items · ${o.total?.toFixed(2)} · {new Date(o.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={o.status} onValueChange={v => handleStatusChange(o, v)}>
                        <SelectTrigger className="h-8 w-[130px] text-xs rounded-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpanded(isOpen ? null : o.id)}
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border bg-white p-4 space-y-4">
                      {/* Customer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {o.customer_email && (
                          <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {o.customer_email}</div>
                        )}
                        {o.customer_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {o.customer_phone}</div>
                        )}
                        {o.shipping_address && (
                          <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2"><MapPin className="w-3.5 h-3.5 mt-0.5" /> {o.shipping_address}</div>
                        )}
                      </div>

                      {/* Line items */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" /> Items Sold
                        </p>
                        <div className="space-y-2">
                          {(o.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm border-b border-border/60 pb-2 last:border-0">
                              <div>
                                <p className="font-medium text-onyx">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity}
                                  {item.length ? ` · ${item.length}` : ''}
                                  {item.color ? ` · ${item.color}` : ''}
                                </p>
                              </div>
                              <p className="font-medium text-gold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-3 pt-2 border-t border-border text-sm">
                          <span className="font-medium">Total</span>
                          <span className="font-semibold text-gold">${o.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}