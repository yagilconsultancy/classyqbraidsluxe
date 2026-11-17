// GET /files/* -- streams a previously uploaded file back out of R2.
// Catch-all route (Cloudflare Pages' [[path]] convention) so nested folder
// keys like "proofs/<uuid>-receipt.png" resolve correctly.
export async function onRequestGet({ env, params }) {
  const key = Array.isArray(params.path) ? params.path.join("/") : params.path;
  const obj = await env.UPLOADS.get(key);

  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(obj.body, { headers });
}
