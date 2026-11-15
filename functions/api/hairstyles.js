// GET /api/hairstyles -- public, read-only. Replaces base44.entities.Hairstyle
// for the public pages (Home, Styles, HeroSection). Returns every row (active
// and inactive); the frontend already filters is_active client-side, same as
// it did against Base44.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM hairstyles ORDER BY sort_order ASC, created_date ASC"
  ).all();

  const hairstyles = results.map((row) => ({
    ...row,
    images: row.images ? JSON.parse(row.images) : [],
    size_prices: row.size_prices ? JSON.parse(row.size_prices) : null,
    size_contact_us: row.size_contact_us ? JSON.parse(row.size_contact_us) : [],
    is_active: !!row.is_active,
  }));

  return Response.json(hairstyles, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
