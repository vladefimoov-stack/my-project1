"use client";

import * as THREE from "three";
import { APPS, APP_LABELS_EN, type AppId } from "./apps";
import { KEY_GLYPHS, type KeyDef } from "./device";

const FONT = `"Inter", "Helvetica Neue", Arial, sans-serif`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawAppIcon(ctx: CanvasRenderingContext2D, id: AppId, x: number, y: number, size: number) {
  const app = APPS.find((a) => a.id === id)!;
  const g = ctx.createLinearGradient(0, y, 0, y + size);
  g.addColorStop(0, app.bg[0]);
  g.addColorStop(1, app.bg[1]);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.03;
  roundRect(ctx, x, y, size, size, size * 0.24);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.1);
  ctx.scale((size * 0.8) / 24, (size * 0.8) / 24);
  for (const p of app.paths) {
    ctx.fillStyle = p.fill;
    ctx.fill(new Path2D(p.d), p.evenOdd ? "evenodd" : "nonzero");
  }
  ctx.restore();
}

/** Home screen (launcher) texture — 3:4 portrait, mirrors the reference photo. */
export function makeScreenCanvas(labels: Record<AppId, string> = APP_LABELS_EN, time = "12:48") {
  const W = 768, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // wallpaper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0E1118");
  bg.addColorStop(1, "#1B2130");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.15, H * 0.8, 10, W * 0.15, H * 0.8, W * 0.9);
  glow.addColorStop(0, "rgba(64,140,255,0.35)");
  glow.addColorStop(1, "rgba(64,140,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // status bar
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 34px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText(time, 34, 42);
  // battery
  roundRect(ctx, W - 76, 28, 42, 26, 6); ctx.fill();
  ctx.fillRect(W - 33, 36, 4, 10);
  // wifi
  ctx.save(); ctx.translate(W - 116, 56);
  ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 5; ctx.lineCap = "round";
  for (const r of [8, 17, 26]) { ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // signal
  for (let i = 0; i < 4; i++) ctx.fillRect(W - 210 + i * 11, 54 - (i + 1) * 6, 7, (i + 1) * 6);

  // icon grid
  const size = 156;
  const cols = [W / 6, W / 2, (W * 5) / 6];
  const rowsY = [128, 418, 708];
  APPS.forEach((app, i) => {
    const cx = cols[i % 3];
    const y = rowsY[Math.floor(i / 3)];
    drawAppIcon(ctx, app.id, cx - size / 2, y, size);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `500 30px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(labels[app.id], cx, y + size + 16);
    ctx.textAlign = "left";
  });
  // page dots
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath(); ctx.arc(W / 2 - 14, H - 34, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath(); ctx.arc(W / 2 + 14, H - 34, 6, 0, Math.PI * 2); ctx.fill();
  return c;
}

export function canvasTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Transparent label for one keypad key (printed legend). */
export function makeKeyLabelCanvas(key: KeyDef, aspect: number) {
  const H = 128, W = Math.round(H * aspect);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#D9DADE";
  if (key.icon) {
    const s = H * 0.62;
    ctx.save();
    ctx.translate(W / 2 - s / 2, H / 2 - s / 2);
    ctx.scale(s / 24, s / 24);
    ctx.fill(new Path2D(KEY_GLYPHS[key.icon]), "evenodd");
    ctx.restore();
  } else {
    ctx.textBaseline = "middle";
    ctx.font = `400 ${H * 0.62}px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(key.main, W * 0.47, H * 0.54);
    if (key.sub) {
      ctx.font = `600 ${H * 0.24}px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(key.sub, W * 0.53, H * 0.56);
    }
  }
  return c;
}

/** Subtle printed wordmark for the back cover. */
export function makeBackLogoCanvas(text: string) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(210,212,218,0.55)";
  ctx.font = `600 64px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "10px";
  ctx.fillText(text.toUpperCase(), 256, 66);
  return c;
}
