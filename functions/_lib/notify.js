import { trySend, adminEmail, prepBooking, prepOrder } from "./email.js";
import { buildBookingReceived } from "./email/bookingReceived.js";
import { buildBookingAdmin } from "./email/bookingAdmin.js";
import { buildBookingStatus } from "./email/bookingStatus.js";
import { buildOrderCreated } from "./email/orderCreated.js";
import { buildEmail as buildOrderStatus } from "./email/orderStatus.js";

export async function notifyBookingCreated(env, row) {
  const b = prepBooking(row);
  const jobs = [];
  if (row.customer_email) {
    const t = buildBookingReceived(b);
    jobs.push(trySend(env, { to: row.customer_email, subject: t.subject, html: t.html }));
  }
  const a = buildBookingAdmin(b);
  jobs.push(trySend(env, { to: adminEmail(env), subject: a.subject, html: a.html, replyTo: row.customer_email || undefined }));
  await Promise.all(jobs);
}

export async function notifyBookingStatus(env, row, prevStatus) {
  if (!row.customer_email || row.status === prevStatus) return;
  const t = buildBookingStatus(prepBooking(row), row.status);
  if (t) await trySend(env, { to: row.customer_email, subject: t.subject, html: t.html });
}

export async function notifyOrderCreated(env, row) {
  const t = buildOrderCreated(prepOrder(row));
  const jobs = [];
  if (t.admin) jobs.push(trySend(env, { to: adminEmail(env), subject: t.admin.subject, html: t.admin.html, replyTo: row.customer_email || undefined }));
  if (t.client) jobs.push(trySend(env, { to: t.client.to, subject: t.client.subject, html: t.client.html }));
  await Promise.all(jobs);
}

export async function notifyOrderStatus(env, row, prev) {
  if (!row.customer_email) return;
  let type = null;
  if (row.status === "cancelled" && prev.status !== "cancelled") type = "cancelled";
  else if (row.status === "shipped" && prev.status !== "shipped") type = "shipped";
  else if (row.status === "delivered" && prev.status !== "delivered") type = "delivered";
  else if (row.payment_status === "paid" && prev.payment_status !== "paid") type = "payment_confirmed";
  if (!type) return;
  const t = buildOrderStatus(prepOrder(row), type);
  await trySend(env, { to: row.customer_email, subject: t.subject, html: t.html });
}
