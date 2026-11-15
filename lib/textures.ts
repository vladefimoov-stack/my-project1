"use client";

import * as THREE from "three";
import { APPS, APP_LABELS_EN, type AppId } from "./apps";
import { AZ, LAUNCHER_ORDER } from "./launcher";
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


/** Blue "wave" wallpaper similar to the real device. */
export function drawWallpaper(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0A1A5C");
  bg.addColorStop(1, "#122B8F");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const wave = ctx.createLinearGradient(W * 0.3, 0, W, H);
  wave.addColorStop(0, "#3D63F0");
  wave.addColorStop(1, "#1C3CC4");
  ctx.fillStyle = wave;
  ctx.beginPath();
  ctx.moveTo(W * 0.42, 0);
  ctx.bezierCurveTo(W * 0.2, H * 0.25, W * 0.75, H * 0.4, W * 0.48, H * 0.62);
  ctx.bezierCurveTo(W * 0.25, H * 0.8, W * 0.55, H * 0.95, W * 0.5, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, 0);
  ctx.closePath();
  ctx.fill();
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.15, 10, W * 0.85, H * 0.15, W * 0.7);
  glow.addColorStop(0, "rgba(140,170,255,0.45)");
  glow.addColorStop(1, "rgba(140,170,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

/** Home screen texture — list launcher, matching the real device's UI layout. */
export function makeScreenCanvas(labels: Record<AppId, string> = APP_LABELS_EN, time = "12:48", date = "Mon, Nov 9") {
  date = date || "Mon, Nov 9";
  const W = 768, H = 952;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  drawWallpaper(ctx, W, H);

  // status bar
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 32px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText(time, 30, 38);
  roundRect(ctx, W - 74, 26, 40, 24, 6); ctx.fill();
  ctx.fillRect(W - 33, 33, 4, 10);
  ctx.save(); ctx.translate(W - 112, 50);
  ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 5; ctx.lineCap = "round";
  for (const r of [8, 16, 24]) { ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 4; i++) ctx.fillRect(W - 196 + i * 11, 50 - (i + 1) * 6, 7, (i + 1) * 6);

  // date header
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText(date, 120, 150);

  // app list
  const rowH = 84, top = 200, icon = 58;
  LAUNCHER_ORDER.slice(0, 8).forEach((id, i) => {
    const y = top + i * rowH;
    if (i === 2) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      roundRect(ctx, 96, y - 8, W - 250, rowH - 6, 22); ctx.fill();
    }
    drawAppIcon(ctx, id, 120, y + 4, icon);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `500 32px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(labels[id], 205, y + 4 + icon / 2);
  });

  // A–Z index
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `600 22px ${FONT}`;
  ctx.textAlign = "center";
  const step = (H - 520) / AZ.length;
  [...AZ].forEach((ch, i) => ctx.fillText(ch, W - 52, 230 + i * step));
  ctx.textAlign = "left";
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
  ctx.fillStyle = "#F2F2F4";
  if (key.icon) {
    const s = H * (key.icon === "menu" ? 0.7 : 0.6);
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
