// GET /api/cart-items?session_id=xxx -- returns only that session's cart
// items (an anonymous localStorage-generated id, no auth). Requiring the
// query param, rather than listing everything, keeps one customer's cart
// from being visible to another. Replaces base44.entities.CartItem.filter(...).
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return Response.json([]);
  }

  const { results } = await env.DB
    .prepare("SELECT * FROM cart_items WHERE session_id = ? ORDER BY created_date ASC")
    .bind(sessionId)
    .all();

  return Response.json(results);
}

// POST /api/cart-items -- adds one item. Replaces base44.entities.CartItem.create(...).
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { session_id, product_id, product_name, product_image, price, quantity, selected_length, selected_color } = body;

  if (!session_id || !product_id || !product_name || price == null) {
    return new Response(
      JSON.stringify({ error: "Missing required cart item fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO cart_items (id, session_id, product_id, product_name, product_image, quantity, price, selected_length, selected_color)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, session_id, product_id, product_name, product_image || null,
    quantity || 1, price, selected_length || null, selected_color || null
  ).run();

  return Response.json({ id });
}
