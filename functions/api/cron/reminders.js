// POST /api/cron/reminders -- hourly job (see workers/reminders). Sends the 72h/24h
// reminders to confirmed bookings, once each. Auth: "Authorization: Bearer <CRON_SECRET>".
import { trySend, prepBooking } from "../../_lib/email.js";
import { torontoParts, appointmentEpochMs, buildReminder } from "../../_lib/email/reminder.js";

export async function onRequestPost({ request, env }) {
  const secret = env.CRON_SECRET;
  const auth = request.headers.get("Authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { results } = await env.DB.prepare("SELECT * FROM bookings WHERE status = 'confirmed' AND customer_email IS NOT NULL").all();
  const np = torontoParts(new Date());
  const nowMs = Date.UTC(np.year, np.month - 1, np.day, np.hour, np.minute, np.second);
  let sent72 = 0, sent24 = 0, errors = 0;

  for (const row of results) {
    const apptMs = appointmentEpochMs(row.appointment_date, row.appointment_time);
    if (apptMs === null) continue;
    const hours = (apptMs - nowMs) / 3600000;
    let label = null, col = null;
    if (hours <= 72 && hours > 24 && !row.reminder_72h_sent) { label = "72 hours"; col = "reminder_72h_sent"; }
    else if (hours <= 24 && hours >= 0 && !row.reminder_24h_sent) { label = "24 hours"; col = "reminder_24h_sent"; }
    if (!label) continue;
    const { subject, html } = buildReminder(prepBooking(row), label);
    if (await trySend(env, { to: row.customer_email, subject, html })) {
      await env.DB.prepare(`UPDATE bookings SET ${col} = 1 WHERE id = ?`).bind(row.id).run();
      col === "reminder_72h_sent" ? sent72++ : sent24++;
    } else errors++;
  }
  return Response.json({ ok: true, sent72h: sent72, sent24h: sent24, errors });
}
