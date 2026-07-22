import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const hairTypeLabels = {
  human_hair: 'Human Hair', synthetic_hair: 'Synthetic Hair', curly_extensions: 'Curly Extensions',
  straight_extensions: 'Straight Extensions', body_wave_hair: 'Body Wave Hair',
};
const sizeLabels = {
  extra_small: 'Extra Small', small: 'Small', small_medium: 'Small/Medium',
  medium: 'Medium', large: 'Large', extra_large: 'Extra Large',
};
const lengthLabels = {
  shoulder: 'Shoulder Length', mid_back: 'Mid Back', waist: 'Waist Length',
  hip: 'Hip Length', custom: 'Custom Length',
};

function row(label, value) {
  if (!value && value !== 0) return '';
  return `<tr><td style="font-size:10px;color:#888888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">${label}</td><td style="font-size:14px;color:#111111;padding:4px 0;">${value}</td></tr>`;
}

function buildConfirmed(booking) {
  const total = booking.total_price || 0;
  const requiresQuote = booking.requires_quote;
  const balance = requiresQuote ? 'Contact for quote' : `$${Math.max(0, total - 30).toFixed(2)}`;
  const quoteBox = requiresQuote
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:12px;color:#9D7B1C;line-height:1.5;">Your service size requires a custom price quote. Please contact us via WhatsApp at +1 437-299-6513 to confirm your final pricing. The $30 deposit will be deducted from your final price.</td></tr></table>`
    : '';
  const lengthBox = ['waist', 'hip', 'custom'].includes(booking.hair_length)
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#F8F4EE;border:1px solid #E8E2D5;font-size:12px;color:#666666;line-height:1.5;">Please note: lengths beyond Mid Back attract an additional fee. The final price will be confirmed at your appointment.</td></tr></table>`
    : '';

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">Appointment Confirmed</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 6px;font-size:20px;color:#111111;font-family:Georgia,serif;">Hi ${booking.customer_name},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Great news! Your appointment has been confirmed. We look forward to seeing you and creating your beautiful look.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="background-color:#F8F4EE;padding:16px 20px;border-left:3px solid #9D7B1C;">
<p style="margin:0;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.12em;">Reference Number</p>
<p style="margin:4px 0 0;font-size:18px;color:#111111;font-weight:600;font-family:Courier,monospace;">${booking.reference_number}</p>
</td></tr></table>
<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Appointment Details</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Style', booking.hairstyle_name)}
${row('Hair Type', hairTypeLabels[booking.hair_type] || booking.hair_type)}
${row('Size', sizeLabels[booking.hair_size] || booking.hair_size)}
${row('Length', lengthLabels[booking.hair_length] || booking.hair_length)}
${row('Date', booking.appointment_date)}
${row('Time', booking.appointment_time)}
</table></td></tr></table>
<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Payment Summary</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#FAF3E0;border:1px solid #E8D9B0;"><tr><td style="padding:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-size:13px;color:#666666;padding:5px 0;">Deposit Received</td><td style="font-size:15px;color:#9D7B1C;font-weight:600;text-align:right;padding:5px 0;">$30.00</td></tr>
<tr><td colspan="2" style="padding:8px 0;border-top:1px dashed #E8D9B0;"></td></tr>
<tr><td style="font-size:13px;color:#111111;font-weight:500;padding:5px 0;">Balance Due at Appointment</td><td style="font-size:18px;color:#111111;font-weight:700;text-align:right;padding:5px 0;">${balance}</td></tr>
</table></td></tr></table>
${quoteBox}${lengthBox}
<p style="margin:24px 0 0;font-size:13px;color:#666666;line-height:1.6;">If you have any questions, feel free to reach out to us at <strong style="color:#111111;">437-299-6513</strong> or reply to this email.</p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: 'Your Appointment is Confirmed - ClassyqBraidsLuxe', html };
}

function buildSimple(booking, type) {
  const ref = booking.reference_number || booking.id;
  const titles = {
    in_progress: 'Appointment In Progress',
    completed: 'Appointment Complete',
    cancelled: 'Appointment Cancelled',
  };
  const intros = {
    in_progress: `Hi ${booking.customer_name},<br><br>Your appointment <strong>${ref}</strong> is now in progress. We're working on your beautiful look and will have you styled shortly.`,
    completed: `Hi ${booking.customer_name},<br><br>Your appointment <strong>${ref}</strong> is now complete. Thank you for choosing ClassyqBraidsLuxe! We'd love to see you again soon.`,
    cancelled: `Hi ${booking.customer_name},<br><br>Your appointment <strong>${ref}</strong> has been cancelled. If you'd like to reschedule or believe this was a mistake, please contact us at <strong>437-299-6513</strong>.`,
  };
  const subjects = {
    in_progress: `Your Appointment ${ref} is In Progress`,
    completed: `Your Appointment ${ref} is Complete`,
    cancelled: `Appointment ${ref} Cancelled`,
  };
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">${titles[type]}</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 20px;font-size:14px;color:#666666;line-height:1.6;">${intros[type]}</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;">
${row('Style', booking.hairstyle_name)}
${row('Date', booking.appointment_date)}
${row('Time', booking.appointment_time)}
</td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#666666;line-height:1.6;">If you have any questions, feel free to reach out to us at <strong style="color:#111111;">437-299-6513</strong> or reply to this email.</p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: subjects[type], html };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body.event || {};
    const entityId = event.entity_id;
    let booking = body.data;
    const prev = body.old_data;

    if (!booking && entityId) {
      booking = await base44.asServiceRole.entities.Booking.get(entityId);
    }
    if (!booking) return Response.json({ skipped: true, reason: 'no booking' });
    if (!prev) return Response.json({ skipped: true, reason: 'no previous data' });

    const email = booking.customer_email;
    if (!email) return Response.json({ skipped: true, reason: 'no email' });

    const prevStatus = prev.status;
    const newStatus = booking.status;
    if (prevStatus === newStatus) return Response.json({ skipped: true, reason: 'status unchanged' });

    let template = null;
    if (newStatus === 'confirmed') template = buildConfirmed(booking);
    else if (newStatus === 'in_progress') template = buildSimple(booking, 'in_progress');
    else if (newStatus === 'completed') template = buildSimple(booking, 'completed');
    else if (newStatus === 'cancelled') template = buildSimple(booking, 'cancelled');

    if (!template) return Response.json({ skipped: true, reason: 'no meaningful change' });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'ClassyqBraidsLuxe',
      subject: template.subject,
      body: template.html,
    });
    return Response.json({ success: true, sent: newStatus });
  } catch (error) {
    console.error('sendBookingStatusEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});