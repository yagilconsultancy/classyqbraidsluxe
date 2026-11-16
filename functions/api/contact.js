// POST /api/contact -- contact form -> email to the salon inbox (replaces base44 SendEmail).
import { sendEmail, escapeHtml } from "../_lib/email.js";

const INBOX = "hello@classyqbraidsluxe.com";

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 200);
  const phone = String(b.phone || "").trim().slice(0, 50);
  const message = String(b.message || "").trim().slice(0, 5000);
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Name, valid email and message are required" }, { status: 400 });
  }
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.6">
<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Phone:</strong> ${escapeHtml(phone) || "-"}</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p></div>`;
  try {
    await sendEmail(env, { to: env.CONTACT_EMAIL || INBOX, subject: `Contact Form: ${name}`, html, replyTo: email });
  } catch (e) {
    console.error("contact email failed:", e.message);
    return Response.json({ error: "Could not send message. Please try again or call us." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
