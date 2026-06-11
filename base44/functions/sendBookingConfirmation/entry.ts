import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: booking.customer_email,
      subject: `✅ Your Appointment is Confirmed — ClassyqBraidsLuxe`,
      body: `
Hi ${booking.customer_name},

Great news! Your appointment has been confirmed. We look forward to seeing you!

━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Reference:    ${booking.reference_number}
Style:        ${booking.hairstyle_name}
Date:         ${booking.appointment_date}
Time:         ${booking.appointment_time}
━━━━━━━━━━━━━━━━━━━━━━━━

💰 Payment Reminder:
Your $30 deposit has been received. Please bring the remaining balance of $${((booking.total_price || 0) - 30).toFixed(2)} in cash on the day of your appointment.

${booking.notes ? `📝 Your Notes: ${booking.notes}\n` : ''}
If you have any questions, feel free to reach out to us.

See you soon! 💛
— ClassyqBraidsLuxe Team
      `.trim(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send confirmation email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});