import { notifyBookingCreated } from "../_lib/notify.js";

// GET /api/bookings -- public, read-only. Used only to compute which time
// slots are already taken on a given date (see DateTimeSelector.jsx). This
// endpoint is intentionally restricted to non-identifying columns only --
// bookings also stores customer_name/email/phone/notes, which must never be
// exposed on a public endpoint. Replaces base44.entities.Booking.filter(...).
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT appointment_date, appointment_time, status FROM bookings"
  ).all();

  return Response.json(results, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I -- avoids ambiguity when read aloud/typed
function generateReference() {
  let ref = "CQ-";
  for (let i = 0; i < 6; i++) ref += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return ref;
}

// POST /api/bookings -- creates a booking. Deposit is paid by Interac
// e-Transfer (manual, not Stripe) before this is called; PaymentProof.jsx
// uploads the screenshot via /api/upload first and passes the resulting URL
// here as payment_proof_url. Status starts "pending" -- staff confirm the
// deposit manually (within 24h, per the UI copy) via the admin panel, which
// is separate, not-yet-migrated work.
export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const {
    hairstyle_id, hairstyle_name, hair_type, hair_size, hair_length,
    inspiration_link, inspiration_media, appointment_date, appointment_time,
    customer_name, customer_email, customer_phone, notes, total_price,
    requires_quote, extension_products, extension_source, payment_proof_url,
  } = body;

  if (!hairstyle_name || !appointment_date || !appointment_time || !customer_name || !customer_email) {
    return new Response(
      JSON.stringify({ error: "Missing required booking fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = crypto.randomUUID();
  let reference_number = generateReference();
  // Collision is astronomically unlikely (33^6 combos) but cheap to guard anyway.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await env.DB
      .prepare("SELECT 1 FROM bookings WHERE reference_number = ?")
      .bind(reference_number)
      .first();
    if (!existing) break;
    reference_number = generateReference();
  }

  await env.DB.prepare(
    `INSERT INTO bookings (
      id, reference_number, hairstyle_id, hairstyle_name, hair_type, hair_size, hair_length,
      inspiration_link, inspiration_media, appointment_date, appointment_time,
      customer_name, customer_email, customer_phone, notes, total_price, requires_quote,
      status, payment_status, payment_proof_url, extension_products, extension_source
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, reference_number, hairstyle_id || null, hairstyle_name, hair_type || null, hair_size || null, hair_length || null,
    inspiration_link || null, JSON.stringify(inspiration_media || []), appointment_date, appointment_time,
    customer_name, customer_email, customer_phone || null, notes || null, total_price || 0, requires_quote ? 1 : 0,
    "pending", "unpaid", payment_proof_url || null, JSON.stringify(extension_products || []), extension_source || null
  ).run();

  const row = await env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  context.waitUntil(notifyBookingCreated(env, row));

  return Response.json({ ref: reference_number });
}
