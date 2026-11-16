// PATCH /api/admin/orders/:id -- whitelisted fields only. Protected by ../_middleware.js.
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

export async function onRequestPatch({ request, env, params }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sets = [];
  const values = [];

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    sets.push("status = ?");
    values.push(body.status);
  }
  if (body.payment_status !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.payment_status)) return Response.json({ error: "Invalid payment_status" }, { status: 400 });
    sets.push("payment_status = ?");
    values.push(body.payment_status);
  }
  if (body.shipping_address !== undefined) {
    sets.push("shipping_address = ?");
    values.push(body.shipping_address || null);
  }

  if (sets.length === 0) {
    return Response.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const current = await env.DB.prepare("SELECT status, items FROM orders WHERE id = ?").bind(params.id).first();
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });

  sets.push("updated_date = datetime('now')");
  values.push(params.id);

  const statements = [env.DB.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`).bind(...values)];

  // Shipping an order takes its items out of stock (replaces Base44's shipOrder
  // function). Only on the first transition into "shipped", and never below 0.
  // Batched with the status update so the two can't drift apart.
  if (body.status === "shipped" && current.status !== "shipped") {
    let items = [];
    try { items = JSON.parse(current.items || "[]"); } catch { /* nothing to decrement */ }
    for (const it of items) {
      if (!it.product_id) continue;
      statements.push(
        env.DB.prepare(
          "UPDATE products SET inventory_count = MAX(inventory_count - ?, 0), updated_date = datetime('now') WHERE id = ? AND inventory_count IS NOT NULL"
        ).bind(Number(it.quantity) || 1, it.product_id)
      );
    }
  }

  await env.DB.batch(statements);

  return Response.json({ ok: true });
}
