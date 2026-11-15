"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useKeys } from "../context";
import { BackButton, useTheme } from "./Shell";

const PLACES = [
  { x: 150, y: 70, color: "#F28C28" },
  { x: 62, y: 205, color: "#2EAE5B" },
  { x: 190, y: 250, color: "#4A6CF7" },
];

export function Maps() {
  const { dict } = useI18n();
  const t = useTheme();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [sel, setSel] = useState<number | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampZoom = (z: number) => Math.min(2.5, Math.max(0.8, z));
  useKeys((k) => {
    const step = 18;
    if (k === "up") return setPan((p) => ({ ...p, y: p.y + step })), true;
    if (k === "down") return setPan((p) => ({ ...p, y: p.y - step })), true;
    if (k === "left") return setPan((p) => ({ ...p, x: p.x + step })), true;
    if (k === "right") return setPan((p) => ({ ...p, x: p.x - step })), true;
    if (k === "ok" || k === "#") return setZoom((z) => clampZoom(z + 0.3)), true;
    if (k === "*") return setZoom((z) => clampZoom(z - 0.3)), true;
    if (k === "softR" && sel !== null) return setSel(null), true;
    return false;
  });

  const land = t.dark ? "#1E2228" : "#EEF0EA";
  const road = t.dark ? "#3A3F48" : "#FFFFFF";
  const roadEdge = t.dark ? "#2B2F36" : "#DADDD5";

  return (
    <div className={`relative h-full overflow-hidden ${t.text}`} style={{ background: land }}>
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(e) => setZoom((z) => clampZoom(z - e.deltaY * 0.002))}
      >
        <motion.svg
          viewBox="0 0 240 320"
          className="h-full w-full"
          animate={{ x: pan.x, y: pan.y, scale: zoom }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          aria-hidden="true"
        >
          <rect x="-200" y="-200" width="640" height="720" fill={land} />
          <path d="M-40 250 C40 230 90 290 160 270 S260 240 300 260 L300 340 L-40 340Z" fill={t.dark ? "#1B3346" : "#B9DCF2"} />
          <rect x="30" y="170" width="70" height="60" rx="8" fill={t.dark ? "#1F3A2A" : "#CDE8C4"} />
          {[
            "M-20 120 L260 95",
            "M-20 200 L260 180",
            "M80 -20 L110 340",
            "M170 -20 L160 340",
            "M-20 40 C60 60 120 20 260 50",
          ].map((d, i) => (
            <g key={i}>
              <path d={d} stroke={roadEdge} strokeWidth={i === 2 ? 13 : 10} fill="none" />
              <path d={d} stroke={road} strokeWidth={i === 2 ? 10 : 7} fill="none" />
            </g>
          ))}
          {sel !== null && (
            <motion.path
              d={`M120 160 L95 150 L${PLACES[sel].x} ${PLACES[sel].y}`}
              stroke="#2F7BF6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}
          {PLACES.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <path d="M0 0 C-8 -10 -8 -22 0 -22 C8 -22 8 -10 0 0Z" fill={p.color} stroke="#fff" strokeWidth="1.5" />
              <circle cy="-15" r="3" fill="#fff" />
            </g>
          ))}
          <circle cx="120" cy="160" r="14" fill="#2F7BF6" opacity=".18" />
          <circle cx="120" cy="160" r="6" fill="#2F7BF6" stroke="#fff" strokeWidth="2.5" />
        </motion.svg>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-[0.3em] p-[0.6em]">
        <div className={`pointer-events-auto flex h-[2.6em] flex-1 items-center gap-[0.3em] rounded-full pl-[0.6em] pr-[0.9em] shadow-md ${t.card}`}>
          <BackButton />
          <span className={`truncate text-[0.9em] ${t.sub}`}>{dict.demo.maps.search}</span>
        </div>
      </div>

      <div className="absolute right-[0.6em] top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded-[0.8em] shadow-md">
        {[
          ["+", 0.3],
          ["−", -0.3],
        ].map(([l, d]) => (
          <button
            key={l as string}
            type="button"
            aria-label={l === "+" ? "Zoom in" : "Zoom out"}
            onClick={() => setZoom((z) => clampZoom(z + (d as number)))}
            className={`h-[2.4em] w-[2.4em] text-[1.1em] font-medium ${t.card} ${t.text} ${t.hover}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-[0.6em]">
        <div className={`rounded-[1em] p-[0.8em] shadow-lg ${t.card}`}>
          {sel === null ? (
            <div className="flex gap-[0.4em] overflow-x-auto no-scrollbar">
              {dict.demo.maps.places.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSel(i)}
                  className={`shrink-0 rounded-full border px-[0.8em] py-[0.35em] text-[0.85em] ${t.line} ${t.hover}`}
                >
                  <span className="mr-[0.3em] inline-block h-[0.6em] w-[0.6em] rounded-full" style={{ background: PLACES[i].color }} />
                  {name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[1em] font-semibold">{dict.demo.maps.places[sel]}</div>
                <div className={`text-[0.8em] ${t.sub}`}>{dict.demo.maps.walk}</div>
              </div>
              <span className="rounded-full bg-[#2F7BF6] px-[0.9em] py-[0.4em] text-[0.85em] font-medium text-white">{dict.demo.maps.route}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
