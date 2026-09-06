import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";
import { buildAppreciation } from "../../shared/appreciationTemplate.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Optional: send to a single booking by id, or all completed bookings.
    let bookings;
    if (body.booking_id) {
      const single = await base44.asServiceRole.entities.Booking.get(body.booking_id);
      bookings = single ? [single] : [];
    } else {
      bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'completed' });
    }

    let sent = 0, errors = 0;
    const failed = [];
    for (const booking of bookings) {
      try {
        if (!booking.customer_email) continue;
        const { subject, html } = buildAppreciation(booking);
        await sendEmail({ to: booking.customer_email, subject, html });
        sent++;
      } catch (e) {
        console.error(`Appreciation failed for booking ${booking.id}:`, e.message);
        errors++;
        failed.push({ id: booking.id, email: booking.customer_email, error: e.message });
      }
    }

    return Response.json({ success: true, sent, errors, failed });
  } catch (error) {
    console.error('sendAppreciationNow error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});