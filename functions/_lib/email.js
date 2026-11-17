// Transactional email via Resend's REST API (replaces Base44's shared/resendEmail.ts).
// Secrets/vars (Pages -> Settings -> Variables): RESEND_API_KEY (secret),
// RESEND_FROM_EMAIL (e.g. bookings@classyqbraidsluxe.com), ADMIN_EMAIL (optional).
const FROM_NAME = "ClassyqBraidsLuxe";
export const DEFAULT_ADMIN_EMAIL = "classyqbraidsluxe@gmail.com";

export async function sendEmail(env, { to, subject, html, replyTo }) {
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = (env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey || !fromEmail) throw new Error("Resend not configured: RESEND_API_KEY or RESEND_FROM_EMAIL missing");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${FROM_NAME} <${fromEmail}>`,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend error (${res.status}): ${await res.text()}`);
  return res.json();
}

// Never lets an email failure break the request that triggered it.
export async function trySend(env, msg) {
  try {
    await sendEmail(env, msg);
    return true;
  } catch (e) {
    console.error("email failed:", msg.subject, e.message);
    return false;
  }
}

export const adminEmail = (env) => env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;

// Customer-entered text is interpolated into HTML templates -- escape it first.
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}
export function escapeDeep(v) {
  if (typeof v === "string") return escapeHtml(v);
  if (Array.isArray(v)) return v.map(escapeDeep);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, escapeDeep(x)]));
  return v;
}

// D1 rows -> the shapes the templates expect (JSON columns parsed, escaped).
const parse = (s, d) => { try { return typeof s === "string" ? JSON.parse(s) : s ?? d; } catch { return d; } };
export function prepBooking(row) {
  const b = { ...row, extension_products: parse(row.extension_products, []), inspiration_media: parse(row.inspiration_media, []) };
  const link = /^https?:\/\//i.test(b.inspiration_link || "") ? b.inspiration_link : null;
  const safe = escapeDeep(b);
  safe.inspiration_link = link ? encodeURI(link).replace(/"/g, "%22") : null;
  return safe;
}
export function prepOrder(row) {
  return escapeDeep({ ...row, items: parse(row.items, []) });
}
