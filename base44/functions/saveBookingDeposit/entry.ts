import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { bookingData, proofImageUrl } = await req.json();

    if (!bookingData || !bookingData.hairstyle_name) {
      return Response.json({ error: 'Missing booking data' }, { status: 400 });
    }

    const ref = 'CBL-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    const booking = await base44.asServiceRole.entities.Booking.create({
      ...bookingData,
      reference_number: ref,
      status: 'pending',
      payment_status: 'unpaid',
      notes: (bookingData.notes || '') + (proofImageUrl ? `\n[Deposit Proof]: ${proofImageUrl}` : ''),
    });

    return Response.json({ booking_id: booking.id, ref });
  } catch (error) {
    console.error('Save booking deposit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});