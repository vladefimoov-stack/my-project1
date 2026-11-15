/**
 * Generates product renders (transparent PNG) and the provisional GLB from
 * the 3D model, using headless Chromium.
 *
 *   1. npm run dev            (or: ENABLE_RENDER_ROUTE=true npm start)
 *   2. npm run renders        (optionally: BASE_URL=http://localhost:3000)
 *
 * Output: public/images/renders/*.png and public/models/kalm-3d.glb
 */
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Playwright is resolved from the project or, via NODE_PATH, a global install
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.resolve("public/images/renders");
const MODELS = path.resolve("public/models");
const only = process.argv.slice(2);

const manifest = {};
const JOBS = [
  { view: "hero", w: 1200, h: 1400 },
  { view: "front", w: 900, h: 1300 },
  { view: "back", w: 900, h: 1300 },
  { view: "threeQuarterFront", w: 1000, h: 1300 },
  { view: "threeQuarterBack", w: 1000, h: 1300 },
  { view: "side", w: 900, h: 1300 },
  { view: "keypadClose", w: 1200, h: 1000 },
  { view: "screenClose", w: 1200, h: 1000 },
  { view: "edges", w: 1000, h: 1000 },
  { view: "scale", w: 1200, h: 1200 },
];
// images that show the screen on the website are rendered once per language
const LOCALIZED = ["hero", "front", "threeQuarterFront"];
const ALL = JOBS.flatMap((j) => (LOCALIZED.includes(j.view) ? ["en", "lt", "de"].map((lang) => ({ ...j, lang })) : [j])).filter(
  (j) => !only.length || only.includes(j.view)
);

await mkdir(OUT, { recursive: true });
await mkdir(MODELS, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

for (const job of ALL) {
  const key = job.lang ? `${job.view}-${job.lang}` : job.view;
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.error(`[${job.view}]`, e.message));
  await page.goto(`${BASE}/render?view=${job.view}${job.lang ? `&lang=${job.lang}` : ""}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__RENDER_READY === true, null, { timeout: 120_000 });
  await page.waitForTimeout(300);
  const png = await page.screenshot({ omitBackground: true, timeout: 120_000 });
  // trim transparent margins, add a small even padding, encode as WebP
  const trimmed = await sharp(png).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.03);
  const file = path.join(OUT, `${key}.webp`);
  const out = await sharp(trimmed.data)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 95, effort: 5 })
    .toFile(file);
  manifest[key] = { width: out.width, height: out.height };
  console.log("✓", file, `${out.width}×${out.height}`);

  if (job.view === "front" && job.lang === "en") {
    const b64 = await page.evaluate(() => window.__exportGLB());
    const glb = path.join(MODELS, "kalm-3d.glb");
    await writeFile(glb, Buffer.from(b64, "base64"));
    console.log("✓", glb);
  }
  await page.close();
}

await browser.close();

// merge with existing manifest (when rendering a subset)
const manifestFile = path.resolve("lib/render-manifest.json");
let existing = {};
try {
  existing = JSON.parse(await readFile(manifestFile, "utf8"));
} catch {}
await writeFile(manifestFile, JSON.stringify({ ...existing, ...manifest }, null, 2) + "\n");

// Open Graph image (1200×630) from the hero render
if (!only.length || only.includes("hero")) {
  const hero = await sharp(path.join(OUT, "hero-en.webp")).resize({ height: 580 }).toBuffer();
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <text x="80" y="270" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="700" fill="#111" letter-spacing="-2">Kalm</text>
    <text x="80" y="340" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#777">The phone for what matters.</text>
  </svg>`);
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#F5F5F5" } })
    .composite([{ input: svg, left: 0, top: 0 }, { input: hero, top: 25, left: 700 }])
    .jpeg({ quality: 86 })
    .toFile(path.resolve("public/images/og.jpg"));
  console.log("✓ public/images/og.jpg");
}
