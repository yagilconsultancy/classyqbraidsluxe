import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, CheckCircle2, ChevronDown, Download, Mail, Phone, Receipt, Search } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api/adminClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadCsv } from '@/lib/csv';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};
const PAY_STYLES = { unpaid: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', refunded: 'bg-red-100 text-red-800' };
const SIZE = { extra_small: 'Extra Small', small: 'Small', small_medium: 'Small-Medium', medium: 'Medium', large: 'Large', extra_large: 'Extra Large' };
const LENGTH = { shoulder: 'Shoulder', mid_back: 'Mid Back', waist: 'Waist', hip: 'Hip', custom: 'Custom' };
const isVideo = (url) => /\.(mp4|webm|mov|ogg|avi)(\?|$)/i.test(url);

function Pill({ className, children }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${className}`}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm mt-0.5">{children}</div>
    </div>
  );
}

function BookingRow({ b, onUpdate, busy }) {
  const [open, setOpen] = useState(b.status === 'pending');
  const prettyDate = b.appointment_date ? format(new Date(b.appointment_date + 'T00:00:00'), 'EEE, MMM d, yyyy') : '—';

  return (
    <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
        <div className="w-12 text-center shrink-0">
          <p className="text-[10px] uppercase text-muted-foreground">{b.appointment_date ? format(new Date(b.appointment_date + 'T00:00:00'), 'MMM') : ''}</p>
          <p className="font-display text-2xl leading-none text-onyx">{b.appointment_date ? format(new Date(b.appointment_date + 'T00:00:00'), 'd') : '—'}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium truncate">{b.customer_name}</span>
            <span className="text-xs font-mono text-gold">{b.reference_number}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.hairstyle_name} · {b.appointment_time}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Pill className={PAY_STYLES[b.payment_status] || 'bg-secondary'}>{b.payment_status}</Pill>
          <Pill className={STATUS_STYLES[b.status] || 'bg-secondary'}>{b.status.replace('_', ' ')}</Pill>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-4 bg-secondary/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Appointment"><span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gold" />{prettyDate} · {b.appointment_time}</span></Field>
            <Field label="Total">{b.requires_quote ? 'Quote required' : `$${(b.total_price || 0).toFixed(2)}`}</Field>
            {b.hair_size && <Field label="Size">{SIZE[b.hair_size] || b.hair_size}</Field>}
            {b.hair_length && <Field label="Length">{LENGTH[b.hair_length] || b.hair_length}</Field>}
            <Field label="Email"><a href={`mailto:${b.customer_email}`} className="flex items-center gap-1.5 hover:text-gold break-all"><Mail className="w-3.5 h-3.5 shrink-0" />{b.customer_email}</a></Field>
            {b.customer_phone && <Field label="Phone"><a href={`tel:${b.customer_phone}`} className="flex items-center gap-1.5 hover:text-gold"><Phone className="w-3.5 h-3.5" />{b.customer_phone}</a></Field>}
            {b.extension_source && <Field label="Extensions">{b.extension_source === 'buy_from_us' ? 'Buying from us' : 'Bringing own'}</Field>}
          </div>

          {b.extension_products?.length > 0 && (
            <Field label="Extensions to purchase">
              <ul className="space-y-0.5 text-muted-foreground">
                {b.extension_products.map((p, i) => (
                  <li key={i}>{p.product_name}{p.length ? ` · ${p.length}` : ''}{p.color ? ` · ${p.color}` : ''} ×{p.quantity || 1} @ ${(p.unit_price || 0).toFixed(2)}</li>
                ))}
              </ul>
            </Field>
          )}

          {b.notes && <Field label="Client notes"><p className="text-muted-foreground whitespace-pre-wrap">{b.notes}</p></Field>}

          {(b.inspiration_link || b.inspiration_media?.length > 0) && (
            <Field label="Inspiration">
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {b.inspiration_media?.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 border border-border rounded overflow-hidden">
                    {isVideo(url) ? <video src={url} className="w-full h-full object-cover" muted /> : <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />}
                  </a>
                ))}
                {b.inspiration_link && <a href={b.inspiration_link} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline">View link →</a>}
              </div>
            </Field>
          )}

          <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-border">
            {b.payment_proof_url ? (
              <a href={b.payment_proof_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 text-xs"><Receipt className="w-3.5 h-3.5" /> View deposit proof</Button>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">No deposit proof on file</span>
            )}
            {b.status === 'pending' && (
              <Button size="sm" disabled={busy} onClick={() => onUpdate(b, { status: 'confirmed' })} className="gap-2 text-xs bg-gold hover:bg-gold/90 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm booking
              </Button>
            )}
            <div className="ml-auto flex items-end gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                <Select value={b.status} onValueChange={(v) => onUpdate(b, { status: v })}>
                  <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Payment</p>
                <Select value={b.payment_status} onValueChange={(v) => onUpdate(b, { payment_status: v })}>
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
        </div>
      )}
    </div>
  );
}

export default function AdminBookings() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('action');
  const [search, setSearch] = useState('');

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.bookings.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.bookings.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Booking updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const groups = useMemo(() => ({
    action: bookings.filter((b) => b.status === 'pending'),
    upcoming: bookings.filter((b) => b.appointment_date >= today && ['confirmed', 'in_progress'].includes(b.status)).reverse(),
    past: bookings.filter((b) => b.appointment_date < today || b.status === 'completed'),
    cancelled: bookings.filter((b) => b.status === 'cancelled'),
    all: bookings,
  }), [bookings, today]);

  const q = search.trim().toLowerCase();
  const visible = groups[tab].filter((b) =>
    !q || [b.customer_name, b.customer_email, b.customer_phone, b.reference_number, b.hairstyle_name].some((v) => (v || '').toLowerCase().includes(q))
  );

  const exportCsv = () => {
    downloadCsv(`bookings-${today}.csv`, visible.map((b) => ({
      reference: b.reference_number, date: b.appointment_date, time: b.appointment_time, style: b.hairstyle_name,
      customer: b.customer_name, email: b.customer_email, phone: b.customer_phone,
      total: b.total_price, status: b.status, payment: b.payment_status,
    })));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white h-auto p-1 flex-wrap">
            {[['action', 'Needs action'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['cancelled', 'Cancelled'], ['all', 'All']].map(([v, label]) => (
              <TabsTrigger key={v} value={v} className="text-xs px-3">
                {label} <span className="ml-1.5 text-muted-foreground tabular-nums">{groups[v].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, ref…" className="pl-9 h-9 bg-white" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!visible.length} className="gap-2 text-xs h-9 bg-white">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive py-8 text-center">Couldn't load bookings: {error.message}</p>
      ) : isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center bg-white border border-border rounded-lg">
          {q ? 'No bookings match your search.' : tab === 'action' ? 'Nothing waiting on you.' : 'No bookings here.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((b) => (
            <BookingRow key={b.id} b={b} busy={updateMutation.isPending} onUpdate={(bk, data) => updateMutation.mutate({ id: bk.id, data })} />
          ))}
        </div>
      )}
    </div>
  );
}
