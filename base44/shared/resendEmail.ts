import { secrets } from "base44:runtime";

/**
 * Sends a transactional email via Resend to any address.
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL secrets to be set.
 */
export async function sendEmail({ to, subject, html, fromName = "ClassyqBraidsLuxe" }) {
  const apiKey = secrets.get("RESEND_API_KEY");
  const fromEmail = (secrets.get("RESEND_FROM_EMAIL") || "").trim();
  if (!apiKey || !fromEmail) {
    throw new Error("Resend not configured: RESEND_API_KEY or RESEND_FROM_EMAIL missing");
  }
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error (${res.status}): ${text}`);
  }
  return await res.json();
}