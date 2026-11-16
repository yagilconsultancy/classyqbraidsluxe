// GET /api/admin/bookings -- full records including customer PII and the
// payment-proof screenshot URL. Protected by ./_middleware.js (Clerk).
export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT * FROM bookings ORDER BY appointment_date DESC, created_date DESC")
    .all();

  const bookings = results.map((r) => {
    let inspiration_media = [];
    let extension_products = [];
    try { inspiration_media = JSON.parse(r.inspiration_media || "[]"); } catch { /* keep [] */ }
    try { extension_products = JSON.parse(r.extension_products || "[]"); } catch { /* keep [] */ }
    return {
      ...r,
      inspiration_media,
      extension_products,
      requires_quote: !!r.requires_quote,
      reminder_72h_sent: !!r.reminder_72h_sent,
      reminder_24h_sent: !!r.reminder_24h_sent,
    };
  });

  return Response.json(bookings);
}
