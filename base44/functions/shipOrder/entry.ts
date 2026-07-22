import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { order_id } = await req.json();
    if (!order_id) return Response.json({ error: 'order_id is required' }, { status: 400 });

    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Only decrement when transitioning INTO shipped for the first time
    if (order.status !== 'shipped') {
      await base44.asServiceRole.entities.Order.update(order_id, { status: 'shipped' });

      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        if (!item.product_id || !item.quantity) continue;
        try {
          const product = await base44.asServiceRole.entities.Product.get(item.product_id);
          if (!product) continue;
          const current = typeof product.inventory_count === 'number' ? product.inventory_count : 0;
          const newCount = Math.max(0, current - item.quantity);
          await base44.asServiceRole.entities.Product.update(item.product_id, { inventory_count: newCount });
        } catch (err) {
          console.error(`Failed to update inventory for product ${item.product_id}: ${err.message}`);
        }
      }
    }

    return Response.json({ success: true, order_id });
  } catch (error) {
    console.error('shipOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});