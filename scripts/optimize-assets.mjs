// One-time: shrink the big images in R2 so pages load fast on phones.
// Run from project root:  npm i -D sharp   then   node scripts/optimize-assets.mjs   (add --dry to preview)
// Uses the originals cached by migrate-assets.mjs (.wrangler/asset-cache). Keeps the SAME R2 keys/URLs,
// so nothing in the site or database changes. Safe to re-run.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const BUCKET = "classyqbraidsluxe-uploads";
const SRC = ".wrangler/asset-cache";
const OUT = ".wrangler/asset-opt";
const DRY = process.argv.includes("--dry");
const MAX = { default: 1400, logo: 480 };           // max width in px
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let before = 0, after = 0;
for (const [i, f] of files.entries()) {
  const buf = readFileSync(`${SRC}/${f}`);
  const isLogo = /logo|Gemini_Generated/i.test(f);
  const img = sharp(buf).rotate();
  const meta = await img.metadata();
  const width = Math.min(meta.width || 9999, isLogo ? MAX.logo : MAX.default);
  const out = await img.resize({ width, withoutEnlargement: true }).webp({ quality: isLogo ? 90 : 78 }).toBuffer();
  before += buf.length; after += Math.min(buf.length, out.length);
  const tag = `[${i + 1}/${files.length}] ${f}: ${(buf.length / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`;
  if (out.length >= buf.length * 0.9) { console.log(`${tag} (skip, no gain)`); continue; }
  if (DRY) { console.log(tag); continue; }
  const path = `${OUT}/${f}.webp`;
  writeFileSync(path, out);
  const r = spawnSync("npx", ["wrangler", "r2", "object", "put", `${BUCKET}/assets/${f}`, "--file", path, "--content-type", "image/webp", "--cache-control", "public,max-age=604800", "--remote"], { shell: true, encoding: "utf8" });
  console.log(r.status === 0 ? `${tag} ok` : `${tag} FAILED ${(r.stderr || "").trim().split("\n").pop()}`);
}
console.log(`\nTotal ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
