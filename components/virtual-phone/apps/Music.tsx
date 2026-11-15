"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useKeys } from "../context";
import { AppBar, useTheme } from "./Shell";

/** Generated tones only (Web Audio) — no recorded or copyrighted music. */
const PATTERNS = [
  [0, 4, 7, 12, 7, 4],
  [0, 3, 7, 10, 7, 3],
  [0, 5, 9, 12, 9, 5],
];
const ROOTS = [261.63, 220, 196];
const ART = [
  "radial-gradient(60% 60% at 30% 30%,#FFD60A,transparent 70%),linear-gradient(135deg,#FF7A59,#7A3CFF)",
  "radial-gradient(60% 60% at 70% 30%,#9AA0A6,transparent 70%),linear-gradient(135deg,#2B2C30,#0E0F12)",
  "radial-gradient(50% 50% at 50% 70%,#4FC3F7,transparent 70%),linear-gradient(135deg,#1A237E,#000)",
];

export function Music() {
  const { dict } = useI18n();
  const m = dict.demo.music;
  const t = useTheme();
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!playing) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    void ctx.resume();
    let i = 0;
    const id = setInterval(() => {
      const semis = PATTERNS[track][i % PATTERNS[track].length];
      const f = ROOTS[track] * Math.pow(2, semis / 12);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.45);
      i++;
      setStep((s) => s + 1);
    }, 300);
    return () => clearInterval(id);
  }, [playing, track]);

  useEffect(() => () => void ctxRef.current?.close().catch(() => {}), []);

  const next = (d: number) => {
    setTrack((x) => (x + d + m.tracks.length) % m.tracks.length);
    setStep(0);
  };

  useKeys((k) => {
    if (k === "ok") return setPlaying((p) => !p), true;
    if (k === "right") return next(1), true;
    if (k === "left") return next(-1), true;
    return false;
  });

  const progress = ((step % 200) / 200) * 100;

  return (
    <div className={`flex h-full flex-col ${t.dark ? "bg-[#0B0B0D] text-white" : "bg-white text-[#111]"}`}>
      <AppBar title={m.title} />
      <div className="flex flex-1 flex-col items-center justify-center px-[1.4em]">
        <div
          className={`aspect-square w-[70%] rounded-[1.2em] shadow-2xl transition-transform duration-500 ${playing ? "scale-100" : "scale-90"}`}
          style={{ background: ART[track] }}
        />
        <div className="mt-[1em] w-full text-center">
          <div className="truncate text-[1.15em] font-semibold">{m.tracks[track].title}</div>
          <div className={`truncate text-[0.85em] ${t.sub}`}>{m.tracks[track].artist}</div>
        </div>
        <div className={`mt-[0.8em] h-[0.25em] w-full overflow-hidden rounded-full ${t.dark ? "bg-white/15" : "bg-black/10"}`}>
          <div className="h-full rounded-full bg-current transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-[0.8em] flex items-center gap-[1.4em]">
          <button type="button" aria-label="Previous" onClick={() => next(-1)} className="p-[0.3em] active:scale-90">
            <svg viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
            className={`flex h-[3.4em] w-[3.4em] items-center justify-center rounded-full active:scale-95 ${t.dark ? "bg-white text-black" : "bg-[#111] text-white"}`}
          >
            <svg viewBox="0 0 24 24" width="1.6em" height="1.6em" fill="currentColor">{playing ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => next(1)} className="p-[0.3em] active:scale-90">
            <svg viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg>
          </button>
        </div>
        <p className={`mt-[1em] text-center text-[0.65em] ${t.sub}`}>{m.note}</p>
      </div>
    </div>
  );
}
