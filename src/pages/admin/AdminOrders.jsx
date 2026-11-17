import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, CheckCircle2, Download, Mail, MapPin, Package, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api/adminClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadCsv } from '@/lib/csv';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
const PAY_COLORS = { unpaid: 'bg-amber-100 text-amber-800', paid: 'bg-green-100 text-green-800', refunded: 'bg-red-100 text-red-800' };

// Older orders stored the proof URL inside shipping_address as "[Deposit Proof]: <url>".
const proofOf = (o) =>
  o.payment_proof_image ||
  (o.shipping_address?.includes('[Deposit Proof]') ? o.shipping_address.replace('[Deposit Proof]:', '').trim() : '');
const addressOf = (o) => (o.shipping_address && !o.shipping_address.includes('[Deposit Proof]') ? o.shipping_address : '');

function Pill({ className, children }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${className}`}>{children}</span>;
}

function OrderRow({ o, onUpdate, busy }) {
  const [open, setOpen] = useState(o.payment_status !== 'paid' && o.status !== 'cancelled');
  const proof = proofOf(o);
  const address = addressOf(o);

  return (
    <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium truncate">{o.customer_name}</span>
            <span className="text-xs font-mono text-gold">{o.order_number}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'} · ${(o.total || 0).toFixed(2)} · {o.created_date ? new Date(o.created_date.replace(' ', 'T') + (o.created_date.includes('Z') ? '' : 'Z')).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Pill className={PAY_COLORS[o.payment_status] || 'bg-secondary'}>{o.payment_status}</Pill>
          <Pill className={STATUS_COLORS[o.status] || 'bg-secondary'}>{o.status}</Pill>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-5 bg-secondary/20">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {o.customer_email && <a href={`mailto:${o.customer_email}`} className="flex items-center gap-2 hover:text-gold break-all"><Mail className="w-3.5 h-3.5 shrink-0" />{o.customer_email}</a>}
            {o.customer_phone && <a href={`tel:${o.customer_phone}`} className="flex items-center gap-2 hover:text-gold"><Phone className="w-3.5 h-3.5" />{o.customer_phone}</a>}
            {address && <p className="flex items-start gap-2 sm:col-span-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{address}</p>}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Items</p>
            <div className="bg-white border border-border rounded-md divide-y divide-border">
              {(o.items || []).map((it, i) => (
                <div key={i} className="flex justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{it.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.quantity}{it.length ? ` · ${it.length}` : ''}{it.color ? ` · ${it.color}` : ''}</p>
                  </div>
                  <p className="text-gold font-medium shrink-0">${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
              <div className="flex justify-between p-3 text-sm font-semibold">
                <span>Total</span><span className="text-gold">${(o.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Payment proof</p>
            {proof ? (
              <a href={proof} target="_blank" rel="noreferrer">
                <img src={proof} alt="Payment proof" className="max-h-48 w-auto rounded border border-border object-contain bg-white" />
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">No proof uploaded.</p>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-border">
            {o.payment_status !== 'paid' && (
              <Button size="sm" disabled={busy} onClick={() => onUpdate(o, { payment_status: 'paid' })} className="gap-2 text-xs bg-gold hover:bg-gold/90 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm payment
              </Button>
            )}
            <div className="ml-auto flex items-end gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                <Select value={o.status} onValueChange={(v) => onUpdate(o, { status: v })}>
                  <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Payment</p>
                <Select value={o.payment_status} onValueChange={(v) => onUpdate(o, { payment_status: v })}>
                  <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Marking an order Shipped automatically deducts its items from stock.</p>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('action');
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.orders.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.orders.update(id, data),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      if (vars.data.status === 'shipped') qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(vars.data.status === 'shipped' ? 'Order shipped & stock updated' : 'Order updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const groups = useMemo(() => ({
    action: orders.filter((o) => o.payment_status !== 'paid' && o.status !== 'cancelled'),
    ship: orders.filter((o) => o.payment_status === 'paid' && ['pending', 'processing'].includes(o.status)),
    done: orders.filter((o) => ['shipped', 'delivered'].includes(o.status)),
    cancelled: orders.filter((o) => o.status === 'cancelled'),
    all: orders,
  }), [orders]);

  const q = search.trim().toLowerCase();
  const visible = groups[tab].filter((o) =>
    !q || [o.customer_name, o.customer_email, o.order_number].some((v) => (v || '').toLowerCase().includes(q))
  );

  const exportCsv = () =>
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, visible.map((o) => ({
      order: o.order_number, date: o.created_date, customer: o.customer_name, email: o.customer_email,
      phone: o.customer_phone, items: (o.items || []).map((i) => `${i.product_name} x${i.quantity}`).join('; '),
      total: o.total, status: o.status, payment: o.payment_status,
    })));

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white h-auto p-1 flex-wrap">
            {[['action', 'Awaiting payment'], ['ship', 'To ship'], ['done', 'Shipped'], ['cancelled', 'Cancelled'], ['all', 'All']].map(([v, label]) => (
              <TabsTrigger key={v} value={v} className="text-xs px-3">
                {label} <span className="ml-1.5 text-muted-foreground tabular-nums">{groups[v].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, order #…" className="pl-9 h-9 bg-white" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!visible.length} className="gap-2 text-xs h-9 bg-white">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive py-8 text-center">Couldn't load orders: {error.message}</p>
      ) : isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center bg-white border border-border rounded-lg">
          {q ? 'No orders match your search.' : 'No orders here.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <OrderRow key={o.id} o={o} busy={updateMutation.isPending} onUpdate={(ord, data) => updateMutation.mutate({ id: ord.id, data })} />
          ))}
        </div>
      )}
    </div>
  );
}
