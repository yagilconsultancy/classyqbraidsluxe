import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  animate, motion, useInView, useMotionValue, useReducedMotion, useTransform,
} from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertCircle, ArrowRight, CalendarCheck, CalendarClock, DollarSign, PackageCheck, RefreshCw, Repeat, TrendingUp, Users,
} from 'lucide-react';
import { adminApi } from '@/api/adminClient';

const GOLD = '#9D7B1C';
const ONYX = '#1a1714';
const SAND = '#d9c9a3';
const STATUS_COLORS = {
  pending: '#d4a017', confirmed: '#3f8f5a', in_progress: '#3b7dd8', completed: '#7c5cbf', cancelled: '#c0504d',
  processing: '#3b7dd8', shipped: '#7c5cbf', delivered: '#3f8f5a',
};
const EASE = [0.22, 1, 0.36, 1];

const money = (n) => `$${Math.round(n || 0).toLocaleString()}`;
const monthLabel = (m) => new Date(`${m}-01T00:00:00`).toLocaleString('en-US', { month: 'short' });

/* ---------- motion primitives ---------- */

// Counts up from 0 when it scrolls into view.
function CountUp({ value, format = (n) => Math.round(n).toLocaleString(), duration = 1.1 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) { mv.set(value); return undefined; }
    const controls = animate(mv, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, value, reduce, duration, mv]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

// Draws itself in, then fills softly.
function Sparkline({ data, color = GOLD }) {
  const reduce = useReducedMotion();
  const w = 96, h = 32, pad = 2;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2), h - pad - (v / max) * (h - pad * 2)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  const id = useRef(`sp-${Math.random().toString(36).slice(2, 8)}`).current;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-8 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.9, duration: 0.6 }} />
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      />
      <motion.circle
        cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: reduce ? 0 : 1.2, type: 'spring', stiffness: 400, damping: 15 }}
      />
    </svg>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };

/* ---------- cards ---------- */

function Kpi({ icon: Icon, label, value, format, sub, accent = GOLD, spark }) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-shadow cursor-default"
    >
      {/* accent bar that sweeps across on hover */}
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />
      {/* soft glow blob */}
      <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" style={{ background: `${accent}22` }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-onyx tabular-nums truncate">
            <CountUp value={value} format={format} />
          </p>
        </div>
        <motion.div
          whileHover={{ rotate: [0, -12, 10, -6, 0], scale: 1.12 }}
          transition={{ duration: 0.6 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </motion.div>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <p className="text-xs text-muted-foreground">{sub}</p>
        {spark && <Sparkline data={spark} color={accent} />}
      </div>
    </motion.div>
  );
}

function Panel({ title, hint, children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-lg hover:shadow-black/5 hover:border-gold/40 transition-[box-shadow,border-color] duration-300 ${className}`}
    >
      <div className="mb-4 flex items-baseline gap-3">
        <h3 className="font-display text-base text-onyx">{title}</h3>
        <span className="h-px flex-1 origin-left scale-x-0 bg-gradient-to-r from-gold/50 to-transparent group-hover:scale-x-100 transition-transform duration-700" />
      </div>
      {hint && <p className="-mt-3 mb-4 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </motion.section>
  );
}

function RankList({ items, empty }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  if (!items?.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ul ref={ref} className="space-y-3.5">
      {items.map((i, idx) => (
        <motion.li
          key={i.name}
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: idx * 0.07, duration: 0.45, ease: EASE }}
          whileHover={{ x: 4 }}
          className="group/row"
        >
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex min-w-0 items-center gap-2 pr-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[10px] font-semibold text-gold group-hover/row:bg-gold group-hover/row:text-white transition-colors">{idx + 1}</span>
              <span className="truncate">{i.name}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">{i.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, #c9a43a)` }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(i.count / max) * 100}%` } : {}}
              transition={{ delay: 0.15 + idx * 0.07, duration: 0.9, ease: EASE }}
            />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function StatusDonut({ data, empty }) {
  const [active, setActive] = useState(null);
  const rows = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const total = rows.reduce((s, r) => s + r.value, 0);
  const shown = active != null ? rows[active] : null;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={rows} dataKey="value" innerRadius={38} outerRadius={58} paddingAngle={3} stroke="none"
              animationDuration={1000} animationBegin={150}
              onMouseEnter={(_, i) => setActive(i)} onMouseLeave={() => setActive(null)}
            >
              {rows.map((r, i) => (
                <Cell key={r.name} fill={STATUS_COLORS[r.name] || SAND} opacity={active == null || active === i ? 1 : 0.35} style={{ transition: 'opacity .25s', outline: 'none' }} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold text-onyx tabular-nums leading-none">{shown ? shown.value : total}</span>
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{shown ? shown.name.replace('_', ' ') : 'total'}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1 text-sm">
        {rows.map((r, i) => (
          <li
            key={r.name}
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
            className={`flex items-center justify-between rounded-md px-2 py-1 transition-colors cursor-default ${active === i ? 'bg-secondary' : ''}`}
          >
            <span className="flex items-center gap-2 capitalize">
              <span className="h-2.5 w-2.5 rounded-full transition-transform" style={{ background: STATUS_COLORS[r.name] || SAND, transform: active === i ? 'scale(1.4)' : 'scale(1)' }} />
              {r.name.replace('_', ' ')}
            </span>
            <span className="tabular-nums text-muted-foreground">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttentionStrip({ items }) {
  if (!items.length) return null;
  return (
    <motion.div
      variants={rise}
      className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-4"
    >
      <p className="flex items-center gap-2.5 text-sm font-medium text-onyx">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
        </span>
        Needs your attention
      </p>
      <ul className="mt-2.5 space-y-1">
        {items.map((a, i) => (
          <motion.li key={a.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.1, duration: 0.4, ease: EASE }}>
            <Link to={a.to} className="group/a inline-flex items-center gap-1.5 text-sm text-gold hover:text-onyx transition-colors">
              {a.text}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/a:translate-x-1.5" />
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function Header({ onRefresh, fetching, updatedAt }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <motion.div variants={rise} className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl text-onyx">{greeting}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · here's how the studio is doing
        </p>
      </div>
      <motion.button
        onClick={onRefresh}
        whileTap={{ scale: 0.94 }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs text-muted-foreground hover:border-gold/50 hover:text-onyx transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${fetching ? 'animate-spin' : ''}`} />
        {fetching ? 'Refreshing…' : `Updated ${updatedAt}`}
      </motion.button>
    </motion.div>
  );
}

const tipStyle = { borderRadius: 12, border: '1px solid #ece6d8', boxShadow: '0 8px 24px rgba(0,0,0,.08)', fontSize: 12 };

export default function Dashboard() {
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.analytics.get(),
    refetchInterval: 60000,
  });
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t); }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" style={{ animationDelay: `${i * 90}ms` }} />)}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-white p-6 text-sm">
        <p className="font-medium text-destructive">Couldn't load analytics.</p>
        <p className="mt-1 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const { kpis: k, revenue_by_month, volume_by_month, booking_status, order_status, top_styles, top_products, busiest_days, busiest_times } = data;
  const revenue = revenue_by_month.map((r) => ({ ...r, label: monthLabel(r.month) }));
  const volume = volume_by_month.map((r) => ({ ...r, label: monthLabel(r.month) }));
  const attention = [
    k.pending_bookings > 0 && { to: '/admin/bookings', text: `${k.pending_bookings} booking${k.pending_bookings > 1 ? 's' : ''} awaiting deposit confirmation` },
    k.pending_orders > 0 && { to: '/admin/orders', text: `${k.pending_orders} order${k.pending_orders > 1 ? 's' : ''} awaiting payment confirmation` },
    k.low_stock_products > 0 && { to: '/admin/products', text: `${k.low_stock_products} product${k.low_stock_products > 1 ? 's' : ''} low on stock` },
  ].filter(Boolean);

  const mins = Math.floor((Date.now() - dataUpdatedAt) / 60000);
  const updatedAt = mins < 1 ? 'just now' : `${mins}m ago`;
  const revSpark = revenue.map((r) => r.bookings + r.orders);
  const bookSpark = volume.map((r) => r.bookings);
  const orderSpark = volume.map((r) => r.orders);
  const axis = { fontSize: 11, fill: '#8a8176' };
  const repeatPct = k.total_customers ? (k.repeat_customers / k.total_customers) * 100 : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <Header onRefresh={() => refetch()} fetching={isFetching} updatedAt={updatedAt} />
      <AttentionStrip items={attention} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={DollarSign} label="Total revenue" value={k.total_revenue} format={money} sub={`${money(k.booking_revenue)} bookings · ${money(k.order_revenue)} shop`} accent="#3f8f5a" spark={revSpark} />
        <Kpi icon={CalendarClock} label="Upcoming (7 days)" value={k.upcoming_7d} sub={`${k.todays_bookings} today`} accent={GOLD} />
        <Kpi icon={TrendingUp} label="Avg booking value" value={k.avg_booking_value} format={money} sub={`${(k.cancel_rate * 100).toFixed(0)}% cancellation rate`} accent="#3b7dd8" />
        <Kpi icon={Users} label="Customers" value={k.total_customers} sub={`${k.repeat_customers} repeat`} accent="#7c5cbf" />
        <Kpi icon={CalendarCheck} label="Bookings" value={k.total_bookings} sub={`${k.completed_bookings} completed`} accent={GOLD} spark={bookSpark} />
        <Kpi icon={PackageCheck} label="Shop orders" value={k.total_orders} sub={`${k.pending_orders} pending`} accent="#3b7dd8" spark={orderSpark} />
        <Kpi icon={Repeat} label="Repeat rate" value={repeatPct} format={(n) => `${Math.round(n)}%`} sub="customers with 2+ visits/orders" accent="#7c5cbf" />
        <Kpi icon={AlertCircle} label="Needs action" value={k.pending_bookings + k.pending_orders} sub="pending confirmations" accent="#d4a017" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Revenue" hint="Paid bookings and shop orders, last 12 months" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={revenue} margin={{ left: -10, right: 4 }}>
                <defs>
                  <linearGradient id="gBook" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c9a43a" /><stop offset="100%" stopColor={GOLD} /></linearGradient>
                  <linearGradient id="gShop" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3a342d" /><stop offset="100%" stopColor={ONYX} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ece6d8" strokeDasharray="3 5" />
                <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#f4efe3', radius: 8 }} contentStyle={tipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="bookings" name="Bookings" stackId="a" fill="url(#gBook)" animationDuration={900} />
                <Bar dataKey="orders" name="Shop" stackId="a" fill="url(#gShop)" radius={[6, 6, 0, 0]} animationDuration={900} animationBegin={250} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Booking status">
          <StatusDonut data={booking_status} empty="No bookings yet." />
          <div className="my-4 h-px bg-border" />
          <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">Order status</p>
          <StatusDonut data={order_status} empty="No orders yet." />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Demand" hint="Bookings and orders per month (excl. cancelled)" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={volume} margin={{ left: -20, right: 4 }}>
                <defs>
                  <linearGradient id="aBook" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={GOLD} stopOpacity=".3" /><stop offset="100%" stopColor={GOLD} stopOpacity="0" /></linearGradient>
                  <linearGradient id="aOrd" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={ONYX} stopOpacity=".18" /><stop offset="100%" stopColor={ONYX} stopOpacity="0" /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ece6d8" strokeDasharray="3 5" />
                <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke={GOLD} strokeWidth={2.5} fill="url(#aBook)" dot={false} activeDot={{ r: 5 }} animationDuration={1200} />
                <Area type="monotone" dataKey="orders" name="Orders" stroke={ONYX} strokeWidth={2.5} fill="url(#aOrd)" dot={false} activeDot={{ r: 5 }} animationDuration={1200} animationBegin={200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Busiest days" hint="By appointment weekday">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={busiest_days} margin={{ left: -24, right: 4 }}>
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f4efe3', radius: 8 }} contentStyle={tipStyle} />
                <Bar dataKey="count" name="Bookings" fill="url(#gBook)" radius={[6, 6, 0, 0]} animationDuration={900}>
                  {busiest_days.map((d, i) => <Cell key={i} fill={d.count === Math.max(...busiest_days.map((x) => x.count)) ? GOLD : '#d8c27a'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Panel title="Top hairstyles" hint="By bookings"><RankList items={top_styles} empty="No bookings yet." /></Panel>
        <Panel title="Top products" hint="By units ordered"><RankList items={top_products} empty="No orders yet." /></Panel>
        <Panel title="Popular times" hint="Most-booked appointment slots"><RankList items={busiest_times} empty="No bookings yet." /></Panel>
      </div>
    </motion.div>
  );
}
