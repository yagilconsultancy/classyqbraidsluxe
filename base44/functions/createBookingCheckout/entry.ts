import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { bookingData, successUrl, cancelUrl } = await req.json();

    if (!bookingData || !bookingData.hairstyle_name || !bookingData.total_price) {
      return Response.json({ error: 'Missing booking data' }, { status: 400 });
    }

    // Save booking as pending before payment
    const base44 = createClientFromRequest(req);
    const ref = 'CBL-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    const booking = await base44.asServiceRole.entities.Booking.create({
      ...bookingData,
      reference_number: ref,
      status: 'pending',
      payment_status: 'unpaid',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${bookingData.hairstyle_name} — Appointment`,
            description: `Date: ${bookingData.appointment_date} at ${bookingData.appointment_time}`,
          },
          unit_amount: Math.round(bookingData.total_price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: bookingData.customer_email,
      success_url: `${successUrl}?booking_id=${booking.id}&ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_id: booking.id,
        reference_number: ref,
        type: 'booking',
      },
    });

    return Response.json({ url: session.url, booking_id: booking.id, ref });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});