// GET /api/admin/customers -- customers derived from bookings + orders (there is
// no customers table). Grouped by lowercased email. Protected by _middleware.js.
export async function onRequestGet({ env }) {
  const [b, o] = await Promise.all([
    env.DB.prepare("SELECT customer_name, customer_email, customer_phone, total_price, status, payment_status, appointment_date FROM bookings").all(),
    env.DB.prepare("SELECT customer_name, customer_email, customer_phone, total, status, payment_status, created_date FROM orders").all(),
  ]);
  const map = new Map();
  const get = (email, name, phone) => {
    const key = (email || "").trim().toLowerCase();
    if (!key) return null;
    if (!map.has(key)) map.set(key, { email: key, name, phone: phone || null, bookings: 0, orders: 0, spent: 0, last_activity: null });
    const c = map.get(key);
    if (!c.phone && phone) c.phone = phone;
    return c;
  };
  const later = (c, d) => { if (d && (!c.last_activity || d > c.last_activity)) c.last_activity = d; };
  for (const r of b.results) {
    const c = get(r.customer_email, r.customer_name, r.customer_phone); if (!c) continue;
    c.bookings++; later(c, r.appointment_date);
    if (r.status !== "cancelled" && (r.payment_status === "paid" || r.status === "completed")) c.spent += r.total_price || 0;
  }
  for (const r of o.results) {
    const c = get(r.customer_email, r.customer_name, r.customer_phone); if (!c) continue;
    c.orders++; later(c, (r.created_date || "").slice(0, 10));
    if (r.payment_status === "paid" && r.status !== "cancelled") c.spent += r.total || 0;
  }
  return Response.json([...map.values()].sort((a, z) => (z.last_activity || "").localeCompare(a.last_activity || "")));
}
