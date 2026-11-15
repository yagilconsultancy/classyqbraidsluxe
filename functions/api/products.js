// GET /api/products -- public, read-only. Replaces base44.entities.Product
// for the public pages (Shop, HeroSection). Returns every row; the frontend
// filters is_active/category/product_type client-side, same as before.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM products ORDER BY created_date DESC"
  ).all();

  const products = results.map((row) => ({
    ...row,
    images: row.images ? JSON.parse(row.images) : [],
    length_prices: row.length_prices ? JSON.parse(row.length_prices) : null,
    lengths: row.lengths ? JSON.parse(row.lengths) : [],
    colors: row.colors ? JSON.parse(row.colors) : [],
    is_active: !!row.is_active,
    featured: !!row.featured,
  }));

  return Response.json(products, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
