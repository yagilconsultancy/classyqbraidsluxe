// Shared appreciation email template for completed bookings.
// Used by sendBookingStatusEmail (on transition to 'completed') and
// sendAppreciationNow (bulk send to all completed bookings).

export function buildAppreciation(booking) {
  const ref = booking.reference_number || booking.id;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">Thank You</p>
</td></tr>
<tr><td style="padding:32px 24px;text-align:center;">
<p style="margin:0 0 6px;font-size:26px;color:#111111;font-family:Georgia,serif;">Hi ${booking.customer_name},</p>
<p style="margin:0 0 24px;font-size:15px;color:#9D7B1C;font-family:Georgia,serif;font-style:italic;">Thank you for sitting in our chair.</p>
<p style="margin:0 0 20px;font-size:14px;color:#666666;line-height:1.7;">Your appointment <strong style="color:#111111;">${ref}</strong> is now complete, and we hope you are loving your new look. It was truly a pleasure styling you — the trust you place in us means everything.</p>
<p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.7;">We would be so grateful if you shared your experience with us. Your kind words help our small business grow and let other clients discover ClassyqBraidsLuxe. Tag us on Instagram <strong style="color:#111111;">@Classyqbraids.ca</strong> or reply to this email with your feedback — we read every message.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;text-align:left;">
<p style="margin:0 0 4px;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.12em;">Style</p>
<p style="margin:0 0 12px;font-size:14px;color:#111111;">${booking.hairstyle_name || '—'}</p>
<p style="margin:0 0 4px;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.12em;">Date</p>
<p style="margin:0;font-size:14px;color:#111111;">${booking.appointment_date || '—'}</p>
</td></tr></table>
<p style="margin:0 0 8px;font-size:14px;color:#111111;line-height:1.7;">Ready for your next look? We would love to welcome you back anytime.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;"><tr><td style="background-color:#9D7B1C;padding:14px 32px;text-align:center;">
<a href="https://classyqbraidsluxe.com/book" style="color:#FFFFFF;text-decoration:none;font-size:13px;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Book Your Next Appointment</a>
</td></tr></table>
<p style="margin:0;font-size:13px;color:#666666;line-height:1.6;">With love and gratitude,<br><strong style="color:#9D7B1C;font-family:Georgia,serif;">The ClassyqBraidsLuxe Team</strong></p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: `Thank You for Choosing ClassyqBraidsLuxe`, html };
}