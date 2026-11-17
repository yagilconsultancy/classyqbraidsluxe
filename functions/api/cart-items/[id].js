// PATCH /api/cart-items/:id -- used only to change quantity (Cart.jsx's
// +/- buttons). Replaces base44.entities.CartItem.update(id, { quantity }).
export async function onRequestPatch({ request, env, params }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { quantity } = body;
  if (quantity == null) {
    return new Response(JSON.stringify({ error: "quantity required" }), { status: 400 });
  }

  await env.DB
    .prepare("UPDATE cart_items SET quantity = ?, updated_date = datetime('now') WHERE id = ?")
    .bind(quantity, params.id)
    .run();

  return Response.json({ ok: true });
}

// DELETE /api/cart-items/:id -- replaces base44.entities.CartItem.delete(id).
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM cart_items WHERE id = ?").bind(params.id).run();
  return Response.json({ ok: true });
}
