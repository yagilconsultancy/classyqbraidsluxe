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

async function sendAdminNotification(base44, booking) {
  try {
    const extList = (booking.extension_products || []).map((ep, i) =>
      `  ${i + 1}. ${ep.product_name}${ep.length ? ` (${ep.length})` : ''}${ep.color ? ` — ${ep.color}` : ''} × ${ep.quantity} — $${((ep.unit_price || 0) * ep.quantity).toFixed(2)}`
    ).join('\n');

    const body_text = `
━━━━━━━━━━━━━━━━━━━━━━━━
NEW BOOKING RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━

Reference:      ${booking.reference_number || 'N/A'}
Status:         ${booking.status || 'pending'}
Requires Quote: ${booking.requires_quote ? 'YES — contact customer for pricing' : 'No'}

━━━ CUSTOMER ━━━
Name:           ${booking.customer_name}
Email:          ${booking.customer_email}
Phone:          ${booking.customer_phone || 'N/A'}

━━━ APPOINTMENT ━━━
Style:          ${booking.hairstyle_name}
Hair Type:      ${hairTypeLabels[booking.hair_type] || booking.hair_type || 'N/A'}
Size:           ${sizeLabels[booking.hair_size] || booking.hair_size || 'N/A'}
Length:         ${lengthLabels[booking.hair_length] || booking.hair_length || 'N/A'}
Date:           ${booking.appointment_date}
Time:           ${booking.appointment_time}

━━━ PRICING ━━━
Total Estimate: $${(booking.total_price || 0).toFixed(2)}
Deposit:        $30.00
${booking.requires_quote ? 'Balance:       Contact customer for custom quote' : `Balance:       $${Math.max(0, (booking.total_price || 0) - 30).toFixed(2)}`}

━━━ EXTENSIONS ━━━
${booking.extension_source === 'buy_from_us' ? 'Source: Buying from us' : booking.extension_source === 'own_extensions' ? 'Source: Bringing own extensions' : 'Source: Not specified'}
${extList ? `Ordered:\n${extList}` : 'None ordered'}

━━━ INSPIRATION & NOTES ━━━
${booking.inspiration_link ? `Inspiration Link: ${booking.inspiration_link}` : ''}
${booking.inspiration_media?.length ? `Inspiration Media: ${booking.inspiration_media.length} file(s) attached` : ''}
${booking.notes ? `Customer Notes: ${booking.notes}` : 'No notes'}

━━━━━━━━━━━━━━━━━━━━━━━━
Review this booking in the admin dashboard.
— ClassyqBraidsLuxe System
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 New Booking — ${booking.customer_name} · ${booking.hairstyle_name} · ${booking.appointment_date}`,
      body: body_text,
    });
    console.log('Admin notification email sent successfully for booking', booking.reference_number);
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