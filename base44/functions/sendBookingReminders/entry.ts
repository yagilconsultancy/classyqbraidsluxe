import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendEmail } from "../../shared/resendEmail.ts";

const SALON_ADDRESS = 'Apartment 2007 - 400 Lyle Street, London, Ontario';
const BUZZER_CODE = '2007';
const ARRIVAL_NOTE = 'Please arrive at least 20 minutes before your appointment time. Late arrivals may result in a shortened service or rescheduling, so please plan your travel accordingly.';

// Parse a stored time string ("10:00 AM", "14:00", "2:30 PM") into 24h {hour, minute}
function parseTime(t) {
  if (!t) return null;
  let s = String(t).trim().toUpperCase();
  let ampm = null;
  if (s.endsWith('AM')) { ampm = 'AM'; s = s.slice(0, -2).trim(); }
  else if (s.endsWith('PM')) { ampm = 'PM'; s = s.slice(0, -2).trim(); }
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return { hour: h, minute: min };
}

// Wall-clock epoch in America/Toronto (so appointment vs. now compare correctly)
function torontoParts(d) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t) => (parts.find(p => p.type === t) || {}).value;
  return { year: +get('year'), month: +get('month'), day: +get('day'), hour: +get('hour') === 24 ? 0 : +get('hour'), minute: +get('minute'), second: +get('second') };
}

function appointmentEpochMs(dateStr, timeStr) {
  const t = parseTime(timeStr);
  if (!dateStr || !t) return null;
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], t.hour, t.minute, 0);
}

function row(label, value) {
  if (!value && value !== 0) return '';
  return `<tr><td style="font-size:10px;color:#888888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">${label}</td><td style="font-size:14px;color:#111111;padding:4px 0;">${value}</td></tr>`;
}

function buildReminder(booking, windowLabel) {
  const ref = booking.reference_number || booking.id;
  const total = booking.total_price || 0;
  const requiresQuote = booking.requires_quote;
  const paid = booking.payment_status === 'paid';
  const balance = requiresQuote ? null : Math.max(0, total - 30);

  let balanceBox = '';
  if (!paid) {
    if (requiresQuote) {
      balanceBox = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:13px;color:#9D7B1C;line-height:1.6;">Your service size requires a custom price quote. Your final balance will be confirmed and collected when you arrive for your appointment.</td></tr></table>`;
    } else if (balance > 0) {
      balanceBox = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#FAF3E0;border:1px solid #E8D9B0;"><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:13px;color:#666666;padding:5px 0;">Deposit Received</td><td style="font-size:15px;color:#9D7B1C;font-weight:600;text-align:right;padding:5px 0;">$30.00</td></tr><tr><td colspan="2" style="padding:8px 0;border-top:1px dashed #E8D9B0;"></td></tr><tr><td style="font-size:13px;color:#111111;font-weight:500;padding:5px 0;">Balance Due at Appointment</td><td style="font-size:18px;color:#111111;font-weight:700;text-align:right;padding:5px 0;">$${balance.toFixed(2)}</td></tr></table></td></tr></table>`;
    }
  } else {
    balanceBox = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#F8F4EE;border:1px solid #E8E2D5;font-size:13px;color:#666666;line-height:1.6;">Your appointment is fully paid. No balance is due at your visit.</td></tr></table>`;
  }

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">Appointment Reminder</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 6px;font-size:20px;color:#111111;font-family:Georgia,serif;">Hi ${booking.customer_name},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">This is a friendly reminder that your confirmed appointment is in <strong style="color:#9D7B1C;">${windowLabel}</strong>. We look forward to seeing you soon!</p>

<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Appointment Details</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;">
<tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Reference', ref)}
${row('Style', booking.hairstyle_name)}
${row('Date', booking.appointment_date)}
${row('Time', booking.appointment_time)}
</table></td></tr></table>

<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Salon Location</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8F4EE;border-left:3px solid #9D7B1C;">
<tr><td style="padding:16px 20px;">
<p style="margin:0 0 4px;font-size:14px;color:#111111;font-weight:600;">${SALON_ADDRESS}</p>
<p style="margin:0;font-size:13px;color:#666666;">Buzzer code: <strong style="color:#111111;">${BUZZER_CODE}</strong></p>
</td></tr></table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#FAF3E0;border:1px solid #E8D9B0;">
<tr><td style="padding:16px 20px;font-size:13px;color:#9D7B1C;line-height:1.6;">${ARRIVAL_NOTE}</td></tr></table>

${balanceBox}

<p style="margin:24px 0 0;font-size:13px;color:#666666;line-height:1.6;">If you need to reschedule or have any questions, please contact us at <strong style="color:#111111;">437-299-6513</strong> or reply to this email.</p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return { subject: `Reminder: Your Appointment is in ${windowLabel} - ClassyqBraidsLuxe`, html };
}

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