import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";
import { torontoParts, appointmentEpochMs, buildReminder, windowLabelFromHours } from "../../shared/reminderTemplate.ts";

// One-off: send a reminder right now to every confirmed booking whose
// appointment has not yet passed. Does NOT touch reminder_72h/24h flags so the
// scheduled automation still fires normally for those windows.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'confirmed' });
    const np = torontoParts(new Date());
    const nowMs = Date.UTC(np.year, np.month - 1, np.day, np.hour, np.minute, np.second);

    const sent = [];
    let errors = 0;
    for (const booking of bookings) {
      try {
        if (!booking.customer_email) continue;
        const apptMs = appointmentEpochMs(booking.appointment_date, booking.appointment_time);
        if (apptMs === null) continue;
        const hoursUntil = (apptMs - nowMs) / 3600000;
        if (hoursUntil < 0) continue; // appointment already passed

        const label = windowLabelFromHours(hoursUntil) || 'soon';
        const { subject, html } = buildReminder(booking, label);
        await sendEmail({ to: booking.customer_email, subject, html });
        sent.push({
          reference: booking.reference_number || booking.id,
          name: booking.customer_name,
          email: booking.customer_email,
          date: booking.appointment_date,
          time: booking.appointment_time,
          style: booking.hairstyle_name,
          in_hours: Math.round(hoursUntil),
        });
      } catch (e) {
        console.error(`sendReminderNow failed for booking ${booking.id}:`, e.message);
        errors++;
      }
    }

    return Response.json({ success: true, sent_count: sent.length, sent, errors });
  } catch (error) {
    console.error('sendReminderNow error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});