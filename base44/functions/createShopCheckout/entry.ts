import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { items, customerInfo, successUrl, cancelUrl } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
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
    });

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          description: [item.selected_length, item.selected_color].filter(Boolean).join(' · ') || undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerInfo?.email || undefined,
      success_url: `${successUrl}?order_id=${order.id}&order_number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB'] },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        order_number: orderNumber,
        type: 'shop_order',
      },
    });

    return Response.json({ url: session.url, order_id: order.id, order_number: orderNumber });
  } catch (error) {
    console.error('Shop checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});