import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};

    if (meta.type === 'booking' && meta.booking_id) {
      try {
        await base44.asServiceRole.entities.Booking.update(meta.booking_id, {
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: session.payment_intent,
        });
        console.log(`Booking ${meta.booking_id} marked as paid`);
      } catch (err) {
        console.error('Failed to update booking:', err.message);
      }
    }

    if (meta.type === 'shop_order' && meta.order_id) {
      try {
        await base44.asServiceRole.entities.Order.update(meta.order_id, {
          status: 'processing',
          payment_status: 'paid',
          payment_id: session.payment_intent,
          shipping_address: session.shipping_details?.address
            ? `${session.shipping_details.address.line1}, ${session.shipping_details.address.city}, ${session.shipping_details.address.state} ${session.shipping_details.address.postal_code}`
            : '',
        });
        console.log(`Order ${meta.order_id} marked as paid`);
      } catch (err) {
        console.error('Failed to update order:', err.message);
      }
    }
  }

  return Response.json({ received: true });
});