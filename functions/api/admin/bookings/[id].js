import { notifyBookingStatus } from "../../../_lib/notify.js";

// PATCH /api/admin/bookings/:id -- whitelisted fields only, so a bad client
// call can't rewrite identity/PII columns. Protected by ../_middleware.js.
const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

export async function onRequestPatch(context) {
  const { request, env, params } = context;
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
  if (body.notes !== undefined) {
    sets.push("notes = ?");
    values.push(body.notes || null);
  }
  if (body.total_price !== undefined) {
    const n = Number(body.total_price);
    if (!Number.isFinite(n) || n < 0) return Response.json({ error: "Invalid total_price" }, { status: 400 });
    sets.push("total_price = ?");
    values.push(n);
  }

  if (sets.length === 0) {
    return Response.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const prev = await env.DB.prepare("SELECT status FROM bookings WHERE id = ?").bind(params.id).first();
  if (!prev) return Response.json({ error: "Not found" }, { status: 404 });

  sets.push("updated_date = datetime('now')");
  values.push(params.id);

  const res = await env.DB.prepare(`UPDATE bookings SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
  if (!res.meta?.changes) return Response.json({ error: "Not found" }, { status: 404 });

  if (body.status !== undefined && body.status !== prev.status) {
    const row = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(params.id).first();
    context.waitUntil(notifyBookingStatus(env, row, prev.status));
  }

  return Response.json({ ok: true });
}
