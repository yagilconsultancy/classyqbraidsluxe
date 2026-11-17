// GET /api/availability -- public, read-only. Used to grey out fully-blocked
// days and blocked time ranges in the booking calendar (see
// DateTimeSelector.jsx). Leaves out block_reason and booking_reference --
// neither is needed by the frontend and booking_reference ties a block back
// to a specific booking record. Replaces base44.entities.Availability.filter(...).
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT specific_date, start_time, end_time, is_blocked, day_of_week, is_available, slot_duration_minutes FROM availability"
  ).all();

  const availability = results.map((row) => ({
    ...row,
    is_blocked: !!row.is_blocked,
    is_available: !!row.is_available,
  }));

  return Response.json(availability, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
