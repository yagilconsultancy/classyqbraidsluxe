// GET /api/admin/orders -- full records including customer PII and the
// payment-proof screenshot URL. Protected by ./_middleware.js (Clerk).
export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT * FROM orders ORDER BY created_date DESC")
    .all();

  const orders = results.map((r) => {
    let items = [];
    try { items = JSON.parse(r.items || "[]"); } catch { /* keep [] */ }
    return { ...r, items };
  });

  return Response.json(orders);
}
