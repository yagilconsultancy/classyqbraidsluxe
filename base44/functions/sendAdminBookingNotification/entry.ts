import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";

const ADMIN_EMAIL = 'classyqbraidsluxe@gmail.com';

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

function row(label, value, isLink) {
  if (!value && value !== 0) return '';
  const valHtml = isLink
    ? `<a href="${value}" style="color:#9D7B1C;text-decoration:underline;word-break:break-all;">${value}</a>`
    : value;
  return `<tr><td style="font-size:10px;color:#888888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">${label}</td><td style="font-size:14px;color:#111111;padding:4px 0;">${valHtml}</td></tr>`;
}

function sectionTitle(title) {
  return `<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">${title}</p>`;
}

function sectionBox(innerHtml) {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">${innerHtml}</table></td></tr></table>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const bookingId = body.bookingId || body.event?.entity_id;
    const bookingData = body.data;

    if (!bookingId && !bookingData) {
      return Response.json({ error: 'Missing booking reference' }, { status: 400 });
    }

    let booking = bookingData;
    if (!booking && bookingId) {
      const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
      booking = bookings[0];
    }

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const extProducts = booking.extension_products || [];
    const requiresQuote = booking.requires_quote;
    const total = booking.total_price || 0;

    let extHtml = '';
    if (booking.extension_source) {
      const sourceLabel = booking.extension_source === 'buy_from_us' ? 'Buying from ClassyqBraidsLuxe' : 'Bringing own extensions';
      let extRows = row('Source', sourceLabel);
      if (extProducts.length > 0) {
        extProducts.forEach((ep, i) => {
          const desc = `${ep.product_name}${ep.length ? ' &mdash; ' + ep.length : ''}${ep.color ? ' &mdash; ' + ep.color : ''}`;
          const lineTotal = ((ep.unit_price || 0) * ep.quantity).toFixed(2);
          extRows += `<tr><td style="font-size:10px;color:#888888;text-transform:uppercase;vertical-align:top;padding:4px 0;">Item ${i + 1}</td><td style="font-size:13px;color:#111111;padding:4px 0;">${desc} &nbsp;&times;&nbsp; ${ep.quantity} &nbsp;&mdash;&nbsp; <span style="color:#9D7B1C;font-weight:600;">$${lineTotal}</span></td></tr>`;
        });
        extRows += `<tr><td colspan="2" style="padding:6px 0;border-top:1px solid #E8E2D5;font-size:13px;color:#111111;font-weight:600;text-align:right;">Extensions Total: $${extProducts.reduce((s, ep) => s + (ep.unit_price || 0) * ep.quantity, 0).toFixed(2)}</td></tr>`;
      }
      extHtml = sectionTitle('Extensions') + sectionBox(extRows);
    }

    let notesRows = '';
    if (booking.inspiration_link) notesRows += row('Link', booking.inspiration_link, true);
    if (booking.inspiration_media?.length > 0) notesRows += row('Media', booking.inspiration_media.length + ' file(s) uploaded');
    if (booking.notes) notesRows += row('Notes', booking.notes.replace(/\n/g, '<br>'));
    const notesHtml = notesRows ? sectionTitle('Inspiration & Notes') + sectionBox(notesRows) : '';

    const quoteBanner = requiresQuote
      ? `<p style="margin:10px 0 0;font-size:12px;color:#9D7B1C;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Custom Quote Required &mdash; Contact Customer</p>`
      : '';

    const balanceHtml = requiresQuote
      ? '<span style="color:#9D7B1C;font-style:italic;font-size:13px;">Contact for Quote</span>'
      : `$${Math.max(0, total - 30).toFixed(2)}`;

    const lengthWarn = ['waist', 'hip', 'custom'].includes(booking.hair_length)
      ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td colspan="2" style="padding:10px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:11px;color:#9D7B1C;">Length beyond Mid Back attracts an additional fee. Confirm final price at appointment.</td></tr></table>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;">
<tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">

<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">New Booking Received</p>
</td></tr>

<tr><td style="padding:28px 24px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
<tr><td style="background-color:#F8F4EE;padding:16px 20px;border-left:3px solid #9D7B1C;">
<p style="margin:0;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.12em;">Reference Number</p>
<p style="margin:4px 0 0;font-size:18px;color:#111111;font-weight:600;font-family:Courier,monospace;">${booking.reference_number || 'N/A'}</p>
${quoteBanner}
</td></tr>
</table>

${sectionTitle('Appointment Details')}
${sectionBox(
  row('Style', booking.hairstyle_name) +
  row('Hair Type', hairTypeLabels[booking.hair_type] || booking.hair_type) +
  row('Size', sizeLabels[booking.hair_size] || booking.hair_size) +
  row('Length', lengthLabels[booking.hair_length] || booking.hair_length) +
  row('Date', booking.appointment_date) +
  row('Time', booking.appointment_time)
)}
${lengthWarn}

${sectionTitle('Customer')}
${sectionBox(
  row('Name', booking.customer_name) +
  row('Email', booking.customer_email) +
  row('Phone', booking.customer_phone)
)}

${extHtml}

${sectionTitle('Price Breakdown')}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#FAF3E0;border:1px solid #E8D9B0;">
<tr><td style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-size:13px;color:#666666;padding:5px 0;">Total Estimate</td><td style="font-size:15px;color:#111111;font-weight:600;text-align:right;padding:5px 0;">$${total.toFixed(2)}</td></tr>
<tr><td style="font-size:13px;color:#666666;padding:5px 0;">Deposit Received</td><td style="font-size:15px;color:#9D7B1C;font-weight:600;text-align:right;padding:5px 0;">$30.00</td></tr>
<tr><td colspan="2" style="padding:8px 0;border-top:1px dashed #E8D9B0;"></td></tr>
<tr><td style="font-size:13px;color:#111111;font-weight:500;padding:5px 0;">Balance Due at Appointment</td><td style="font-size:18px;color:#111111;font-weight:700;text-align:right;padding:5px 0;">${balanceHtml}</td></tr>
</table>
</td></tr>
</table>

${notesHtml}

</td></tr>

<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">Review this booking in the admin dashboard.</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Booking - ${booking.customer_name} - ${booking.hairstyle_name} - ${booking.appointment_date}`,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin booking notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});