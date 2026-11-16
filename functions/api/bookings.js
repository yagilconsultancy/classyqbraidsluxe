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
