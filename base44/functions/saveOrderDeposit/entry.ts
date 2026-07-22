import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { items, customerInfo, proofImageUrl } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_name: customerInfo?.name || 'Guest',
      customer_email: customerInfo?.email || '',
      customer_phone: customerInfo?.phone || '',
      items: items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        length: i.selected_length || '',
        color: i.selected_color || '',
      })),
      subtotal,
      total: subtotal,
      status: 'pending',
      payment_status: 'unpaid',
      payment_proof_image: proofImageUrl || '',
    });

    return Response.json({ order_id: order.id, order_number: orderNumber });
  } catch (error) {
    console.error('Save order deposit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});