// POST /api/upload -- accepts multipart/form-data with a `file` field (and
// an optional `folder` field to keep uploads organized), stores it in R2,
// and returns a same-origin URL to fetch it back from. Replaces
// base44.integrations.Core.UploadFile(). Used by PaymentProof.jsx (deposit
// screenshots) and InspirationMediaUploader.jsx (booking reference photos/
// videos). No auth required -- both of these are public-facing upload
// points for customers who don't have accounts.
export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return new Response(JSON.stringify({ error: "Missing file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const MAX_BYTES = 25 * 1024 * 1024; // 25MB -- generous for a phone screenshot or short video
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "File too large (25MB max)" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const folderRaw = formData.get("folder");
  const folder = (typeof folderRaw === "string" ? folderRaw : "uploads").replace(/[^a-z0-9_-]/gi, "") || "uploads";
  const safeName = (file.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
  const key = `${folder}/${crypto.randomUUID()}-${safeName}`;

  await env.UPLOADS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  return Response.json({ file_url: `/files/${key}` });
}
