// POST /api/orders -- creates an order after Interac e-Transfer payment
// (manual, not Stripe) with an uploaded proof screenshot, same pattern as
// bookings. Replaces base44.functions.invoke('saveOrderDeposit', ...).
const ORDER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
function generateOrderNumber() {
  let n = "ORD-";
  for (let i = 0; i < 6; i++) n += ORDER_CHARS[Math.floor(Math.random() * ORDER_CHARS.length)];
  return n;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { items, customerInfo, payment_proof_image } = body;

  if (!Array.isArray(items) || items.length === 0 || !customerInfo?.name || !customerInfo?.email) {
    return new Response(
      JSON.stringify({ error: "Missing required order fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  const id = crypto.randomUUID();
  let order_number = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await env.DB
      .prepare("SELECT 1 FROM orders WHERE order_number = ?")
      .bind(order_number)
      .first();
    if (!existing) break;
    order_number = generateOrderNumber();
  }

  await env.DB.prepare(
    `INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone,
      items, subtotal, total, status, payment_status, payment_proof_image
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, order_number, customerInfo.name, customerInfo.email, customerInfo.phone || null,
    JSON.stringify(items), subtotal, subtotal, "pending", "unpaid", payment_proof_image || null
  ).run();

  return Response.json({ order_number });
}
