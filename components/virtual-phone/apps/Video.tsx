"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/fmt";
import { useKeys } from "../context";
import { Photo } from "./Gallery";
import { AppBar, useTheme } from "./Shell";

const DURATIONS = [252, 498, 135, 600];
const VIEWS = ["12K", "48K", "7.3K", "120K"];
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function Video() {
  const { dict } = useI18n();
  const v = dict.demo.video;
  const t = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (open === null || !playing) return;
    const id = setInterval(() => setPos((p) => (p + 1) % DURATIONS[open]), 1000);
    return () => clearInterval(id);
  }, [open, playing]);

  const start = (i: number) => {
    setOpen(i);
    setPos(0);
    setPlaying(true);
  };

  useKeys((k) => {
    if (open !== null) {
      if (k === "softR") return setOpen(null), true;
      if (k === "ok") return setPlaying((p) => !p), true;
      if (k === "right") return setPos((p) => Math.min(DURATIONS[open] - 1, p + 10)), true;
      if (k === "left") return setPos((p) => Math.max(0, p - 10)), true;
      return false;
    }
    if (k === "up") return setFocus((f) => Math.max(0, f - 1)), true;
    if (k === "down") return setFocus((f) => Math.min(v.items.length - 1, f + 1)), true;
    if (k === "ok") return start(focus), true;
    return false;
  });

  if (open !== null) {
    const dur = DURATIONS[open];
    return (
      <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
        <AppBar title={v.title} />
        <button type="button" onClick={() => setPlaying((p) => !p)} className="relative aspect-video w-full overflow-hidden bg-black" aria-label={playing ? "Pause" : "Play"}>
          <Photo i={open + 2} className={`absolute inset-0 transition-transform duration-[4000ms] ease-linear ${playing ? "scale-110" : "scale-100"}`} />
          <span className="absolute left-[0.5em] top-[0.5em] rounded bg-black/60 px-[0.4em] py-[0.1em] text-[0.65em] font-medium uppercase tracking-wide text-white">
            {v.playing}
          </span>
          {!playing && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg viewBox="0 0 24 24" width="3em" height="3em" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 h-[0.25em] bg-white/30">
            <span className="block h-full bg-[#F2271C] transition-[width] duration-1000 ease-linear" style={{ width: `${(pos / dur) * 100}%` }} />
          </span>
        </button>
        <div className="p-[0.8em]">
          <div className="text-[1.05em] font-semibold leading-snug">{v.items[open]}</div>
          <div className={`mt-[0.2em] text-[0.8em] ${t.sub}`}>
            {v.channel} · {fmt(v.views, { count: VIEWS[open] })} · {mmss(pos)} / {mmss(dur)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
      <AppBar title={v.title} />
      <ul className="no-scrollbar flex-1 space-y-[0.8em] overflow-y-auto px-[0.7em] pb-[0.8em]">
        {v.items.map((title, i) => (
          <li key={title}>
            <button type="button" onClick={() => start(i)} className={`w-full text-left ${focus === i ? "opacity-100" : "opacity-95"}`}>
              <span className={`relative block aspect-video overflow-hidden rounded-[0.7em] ${focus === i ? "ring-2 ring-[#F2271C]" : ""}`}>
                <Photo i={i + 2} className="absolute inset-0" />
                <span className="absolute bottom-[0.4em] right-[0.4em] rounded bg-black/75 px-[0.35em] text-[0.7em] text-white">{mmss(DURATIONS[i])}</span>
              </span>
              <span className="mt-[0.35em] block text-[0.9em] font-semibold leading-snug">{title}</span>
              <span className={`block text-[0.75em] ${t.sub}`}>
                {v.channel} · {fmt(v.views, { count: VIEWS[i] })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
