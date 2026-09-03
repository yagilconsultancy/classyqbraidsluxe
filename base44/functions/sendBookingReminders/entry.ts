import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";
import { torontoParts, appointmentEpochMs, buildReminder } from "../../shared/reminderTemplate.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'confirmed' });
    const np = torontoParts(new Date());
    const nowMs = Date.UTC(np.year, np.month - 1, np.day, np.hour, np.minute, np.second);

    let sent72 = 0, sent24 = 0, errors = 0;
    for (const booking of bookings) {
      try {
        const apptMs = appointmentEpochMs(booking.appointment_date, booking.appointment_time);
        if (apptMs === null) continue;
        const hoursUntil = (apptMs - nowMs) / 3600000;

        // 72-hour reminder
        if (hoursUntil <= 72 && hoursUntil > 24 && !booking.reminder_72h_sent) {
          const { subject, html } = buildReminder(booking, '72 hours');
          await sendEmail({ to: booking.customer_email, subject, html });
          await base44.asServiceRole.entities.Booking.update(booking.id, { reminder_72h_sent: true });
          sent72++;
        }

        // 24-hour reminder
        if (hoursUntil <= 24 && hoursUntil >= 0 && !booking.reminder_24h_sent) {
          const { subject, html } = buildReminder(booking, '24 hours');
          await sendEmail({ to: booking.customer_email, subject, html });
          await base44.asServiceRole.entities.Booking.update(booking.id, { reminder_24h_sent: true });
          sent24++;
        }
      } catch (e) {
        console.error(`Reminder failed for booking ${booking.id}:`, e.message);
        errors++;
      }
    }

    return Response.json({ success: true, sent72h: sent72, sent24h: sent24, errors });
  } catch (error) {
    console.error('sendBookingReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});