import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";

const sizeLabels = {
  extra_small: 'Extra Small', small: 'Small', small_medium: 'Small/Medium',
  medium: 'Medium', large: 'Large', extra_large: 'Extra Large',
};
const lengthLabels = {
  shoulder: 'Shoulder Length', mid_back: 'Mid Back', waist: 'Waist Length',
  hip: 'Hip Length', custom: 'Custom Length',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body.event || {};
    const entityId = event.entity_id;
    let booking = body.data;
    if (!booking && entityId) {
      try {
        const list = await base44.asServiceRole.entities.Booking.filter({ id: entityId });
        booking = list[0];
      } catch (e) {
        return Response.json({ skipped: true, reason: 'booking not found' });
      }
    }
    if (!booking) return Response.json({ skipped: true, reason: 'no booking' });

    const email = booking.customer_email;
    if (!email) return Response.json({ skipped: true, reason: 'no email' });

    const ref = booking.reference_number || 'N/A';
    const details = [
      booking.hairstyle_name ? `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">Style</td><td style="font-size:14px;color:#111;padding:4px 0;">${booking.hairstyle_name}</td></tr>` : '',
      booking.hair_size ? `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">Size</td><td style="font-size:14px;color:#111;padding:4px 0;">${sizeLabels[booking.hair_size] || booking.hair_size}</td></tr>` : '',
      booking.hair_length ? `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">Length</td><td style="font-size:14px;color:#111;padding:4px 0;">${lengthLabels[booking.hair_length] || booking.hair_length}</td></tr>` : '',
      booking.appointment_date ? `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">Date</td><td style="font-size:14px;color:#111;padding:4px 0;">${booking.appointment_date}</td></tr>` : '',
      booking.appointment_time ? `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">Time</td><td style="font-size:14px;color:#111;padding:4px 0;">${booking.appointment_time}</td></tr>` : '',
    ].join('');

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">Booking Received</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 6px;font-size:20px;color:#111111;font-family:Georgia,serif;">Hi ${booking.customer_name || 'there'},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Thank you for booking with ClassyqBraidsLuxe! We've received your appointment request and are reviewing it now.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="background-color:#F8F4EE;padding:16px 20px;border-left:3px solid #9D7B1C;">
<p style="margin:0;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.12em;">Reference Number</p>
<p style="margin:4px 0 0;font-size:18px;color:#111111;font-weight:600;font-family:Courier,monospace;">${ref}</p>
</td></tr></table>
${details ? `<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Appointment Details</p><table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table></td></tr></table>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:12px;color:#9D7B1C;line-height:1.5;">To secure your appointment, please complete your $30 deposit if you haven't already. We'll send a confirmation once your deposit is received and your appointment is confirmed.</td></tr></table>
<p style="margin:0 0 0;font-size:13px;color:#666666;line-height:1.6;">If you have any questions, feel free to reach out to us at <strong style="color:#111111;">437-299-6513</strong> or reply to this email.</p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;

    await sendEmail({
      to: email,
      subject: `Booking Received - ${ref}`,
      html,
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error('sendBookingClientReceived error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});