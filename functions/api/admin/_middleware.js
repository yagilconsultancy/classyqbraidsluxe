// Gates every route under /api/admin/* behind a valid Clerk session.
// Cloudflare Pages Functions run a directory's _middleware.js before any
// route nested under it, so this is the single enforcement point -- no
// individual admin endpoint can forget to check auth.
//
// This is a single-admin app (Clerk Access Mode is Invite-only, no public
// sign-up -- see the migration spec's Auth & MFA section), so any valid
// signed-in session is treated as the admin. If a second staff account is
// ever added, this is the place to add a role/permission check.
import { verifyToken } from "@clerk/backend";

function unauthorized(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequest({ request, env, next }) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return unauthorized("Missing session token");
  }

  if (!env.CLERK_SECRET_KEY) {
    // Fail closed, not open -- misconfiguration should never fall back to public access.
    return unauthorized("Admin API misconfigured");
  }

  try {
    await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
  } catch {
    return unauthorized("Invalid or expired session");
  }

  return next();
}
