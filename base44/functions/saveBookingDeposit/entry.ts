import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAIL = 'classyqbraidsluxe@gmail.com';

const hairTypeLabels = {
  human_hair: 'Human Hair',
  synthetic_hair: 'Synthetic Hair',
  curly_extensions: 'Curly Extensions',
  straight_extensions: 'Straight Extensions',
  body_wave_hair: 'Body Wave Hair',
};

const sizeLabels = {
  extra_small: 'Extra Small',
  small: 'Small',
  small_medium: 'Small/Medium',
  medium: 'Medium',
  large: 'Large',
  extra_large: 'Extra Large',
};

const lengthLabels = {
  shoulder: 'Shoulder Length',
  mid_back: 'Mid Back',
  waist: 'Waist Length',
  hip: 'Hip Length',
  custom: 'Custom Length',
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

async function sendAdminNotification(base44, booking) {
  try {
    const extProducts = booking.extension_products || [];
    const requiresQuote = booking.requires_quote;
    const total = booking.total_price || 0;

    // Extensions section
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

    // Notes & Inspiration section
    let notesHtml = '';
    let notesRows = '';
    if (booking.inspiration_link) notesRows += row('Link', booking.inspiration_link, true);
    if (booking.inspiration_media?.length > 0) notesRows += row('Media', booking.inspiration_media.length + ' file(s) uploaded');
    if (booking.notes) notesRows += row('Notes', booking.notes.replace(/\n/g, '<br>'));
    if (notesRows) notesHtml = sectionTitle('Inspiration & Notes') + sectionBox(notesRows);

    // Quote banner
    const quoteBanner = requiresQuote
      ? `<p style="margin:10px 0 0;font-size:12px;color:#9D7B1C;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Custom Quote Required &mdash; Contact Customer</p>`
      : '';

    // Balance display
    const balanceHtml = requiresQuote
      ? '<span style="color:#9D7B1C;font-style:italic;font-size:13px;">Contact for Quote</span>'
      : `$${Math.max(0, total - 30).toFixed(2)}`;

    // Length fee warning
    const lengthWarn = ['waist', 'hip', 'custom'].includes(booking.hair_length)
      ? `<tr><td colspan="2" style="padding:10px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:11px;color:#9D7B1C;">Length beyond Mid Back attracts an additional fee. Confirm final price at appointment.</td></tr>`
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
${lengthWarn ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">${lengthWarn}</table>` : ''}

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

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      from_name: 'ClassyqBraidsLuxe',
      subject: `New Booking - ${booking.customer_name} - ${booking.hairstyle_name} - ${booking.appointment_date}`,
      body: html,
    });
    console.log('Admin notification email sent for booking', booking.reference_number);
  } catch (emailError) {
    console.error('Failed to send admin notification email:', emailError);
  }
}

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

    // Send admin notification email — must await to ensure delivery before runtime shuts down
    await sendAdminNotification(base44, { ...bookingData, ...booking });

    return Response.json({ booking_id: booking.id, ref });
  } catch (error) {
    console.error('Save booking deposit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});