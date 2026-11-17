// One-time: copy every image/video still hosted on Base44 into our R2 bucket.
// Run from the project root:  node scripts/migrate-assets.mjs        (add --dry to preview)
// Needs: wrangler logged in (npx wrangler whoami). Safe to re-run -- finished files are skipped.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const BUCKET = "classyqbraidsluxe-uploads";
const DRY = process.argv.includes("--dry");
const CACHE = ".wrangler/asset-cache";
const DONE = `${CACHE}/done.json`;
const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", mp4: "video/mp4", mov: "video/quicktime" };

const safe = (u) => decodeURIComponent(u.replace(/\?.*$/, "").replace(/\/$/, "").split("/").pop()).replace(/[^A-Za-z0-9_.-]/g, "_");
const urls = readFileSync("scripts/base44-urls.txt", "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
mkdirSync(CACHE, { recursive: true });
const done = new Set(existsSync(DONE) ? JSON.parse(readFileSync(DONE, "utf8")) : []);
const failed = [];

console.log(`${urls.length} files, ${done.size} already done${DRY ? " (dry run)" : ""}`);
for (const [i, url] of urls.entries()) {
  const name = safe(url);
  const tag = `[${i + 1}/${urls.length}] ${name}`;
  if (done.has(name)) { console.log(`${tag} skip`); continue; }
  if (DRY) { console.log(`${tag} -> r2://${BUCKET}/assets/${name}`); continue; }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const path = `${CACHE}/${name}`;
    writeFileSync(path, buf);
    const ext = name.split(".").pop().toLowerCase();
    const ct = TYPES[ext] || res.headers.get("content-type") || "application/octet-stream";
    const r = spawnSync("npx", ["wrangler", "r2", "object", "put", `${BUCKET}/assets/${name}`, "--file", path, "--content-type", ct, "--remote"], { shell: true, encoding: "utf8" });
    if (r.status !== 0) throw new Error((r.stderr || r.stdout || "wrangler failed").trim().split("\n").slice(-3).join(" | "));
    done.add(name);
    writeFileSync(DONE, JSON.stringify([...done]));
    console.log(`${tag} ok (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    failed.push(name);
    console.log(`${tag} FAILED: ${e.message}`);
  }
}
console.log(failed.length ? `\n${failed.length} failed:\n${failed.join("\n")}\nRe-run to retry them.` : "\nAll files uploaded.");
