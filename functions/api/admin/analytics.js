// GET /api/admin/analytics -- everything the dashboard needs in one call.
// Aggregated in JS rather than SQL: data volume for a single braiding studio
// is small (hundreds of rows), and it keeps the JSON-column handling
// (order items) simple.
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(dateStr) {
  return (dateStr || "").slice(0, 7); // YYYY-MM
}

function lastNMonths(n, now = new Date()) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function countBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k == null || k === "") continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

function topN(map, n) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export async function onRequestGet({ env }) {
  const [{ results: bookings }, { results: orders }, { results: productRows }] = await Promise.all([
    env.DB.prepare(
      "SELECT id, hairstyle_name, appointment_date, appointment_time, customer_email, total_price, status, payment_status, payment_proof_url, created_date FROM bookings"
    ).all(),
    env.DB.prepare(
      "SELECT id, customer_email, items, total, status, payment_status, payment_proof_image, created_date FROM orders"
    ).all(),
    env.DB.prepare("SELECT id, is_active, inventory_count FROM products").all(),
  ]);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const liveBookings = bookings.filter((b) => b.status !== "cancelled");
  const liveOrders = orders.filter((o) => o.status !== "cancelled");
  const paidBookings = bookings.filter((b) => b.payment_status === "paid");
  const paidOrders = orders.filter((o) => o.payment_status === "paid");

  const bookingRevenue = paidBookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const orderRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);

  // Revenue by month (bookings by appointment date, orders by order date)
  const months = lastNMonths(12, now);
  const revenueByMonth = months.map((m) => ({
    month: m,
    bookings: paidBookings.filter((b) => monthKey(b.appointment_date) === m).reduce((s, b) => s + (b.total_price || 0), 0),
    orders: paidOrders.filter((o) => monthKey(o.created_date) === m).reduce((s, o) => s + (o.total || 0), 0),
  }));

  // Volume by month (all non-cancelled, so you can see demand not just paid)
  const volumeByMonth = months.map((m) => ({
    month: m,
    bookings: liveBookings.filter((b) => monthKey(b.appointment_date) === m).length,
    orders: liveOrders.filter((o) => monthKey(o.created_date) === m).length,
  }));

  // Status breakdowns
  const bookingStatus = Object.fromEntries(countBy(bookings, (b) => b.status));
  const orderStatus = Object.fromEntries(countBy(orders, (o) => o.status));

  // Popularity
  const topStyles = topN(countBy(liveBookings, (b) => b.hairstyle_name), 6);

  const productCounts = new Map();
  for (const o of liveOrders) {
    let items = [];
    try { items = JSON.parse(o.items || "[]"); } catch { /* skip malformed */ }
    for (const it of items) {
      if (!it.product_name) continue;
      productCounts.set(it.product_name, (productCounts.get(it.product_name) || 0) + (it.quantity || 1));
    }
  }
  const topProducts = topN(productCounts, 6);

  // Busiest days / times
  const dayCounts = DAY_NAMES.map((name) => ({ name, count: 0 }));
  for (const b of liveBookings) {
    if (!b.appointment_date) continue;
    const dow = new Date(b.appointment_date + "T00:00:00Z").getUTCDay();
    dayCounts[dow].count += 1;
  }
  const busiestTimes = topN(countBy(liveBookings, (b) => b.appointment_time), 6);

  // Customers: distinct emails across bookings + orders, repeat = 2+ transactions
  const perCustomer = new Map();
  for (const r of [...liveBookings, ...liveOrders]) {
    const e = (r.customer_email || "").toLowerCase();
    if (e) perCustomer.set(e, (perCustomer.get(e) || 0) + 1);
  }
  const totalCustomers = perCustomer.size;
  const repeatCustomers = [...perCustomer.values()].filter((c) => c >= 2).length;

  // Needs attention: deposits/payments submitted but not yet confirmed
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const cancelRate = bookings.length ? bookings.filter((b) => b.status === "cancelled").length / bookings.length : 0;
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const avgBookingValue = liveBookings.length
    ? liveBookings.reduce((s, b) => s + (b.total_price || 0), 0) / liveBookings.length
    : 0;

  const lowStock = productRows.filter(
    (p) => p.is_active && typeof p.inventory_count === "number" && p.inventory_count <= 5
  ).length;

  return Response.json({
    generated_at: now.toISOString(),
    kpis: {
      total_revenue: bookingRevenue + orderRevenue,
      booking_revenue: bookingRevenue,
      order_revenue: orderRevenue,
      todays_bookings: liveBookings.filter((b) => b.appointment_date === today).length,
      upcoming_7d: liveBookings.filter((b) => b.appointment_date >= today && b.appointment_date <= in7).length,
      pending_bookings: pendingBookings,
      pending_orders: pendingOrders,
      total_bookings: bookings.length,
      total_orders: orders.length,
      completed_bookings: completedBookings.length,
      cancel_rate: cancelRate,
      avg_booking_value: avgBookingValue,
      total_customers: totalCustomers,
      repeat_customers: repeatCustomers,
      low_stock_products: lowStock,
    },
    revenue_by_month: revenueByMonth,
    volume_by_month: volumeByMonth,
    booking_status: bookingStatus,
    order_status: orderStatus,
    top_styles: topStyles,
    top_products: topProducts,
    busiest_days: dayCounts,
    busiest_times: busiestTimes,
  });
}
