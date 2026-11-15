"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const VIDEOS = ["/videos/real-1.mp4", "/videos/real-2.mp4"];

/** Footage of the real device, shown next to the simulation. */
export function RealVideo() {
  const { dict } = useI18n();
  const r = dict.demo.real;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [inView, idx, reduce]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <figure className="mx-auto w-full max-w-[340px]">
      <div className="relative overflow-hidden rounded-[28px] bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <video
          key={idx}
          ref={ref}
          src={VIDEOS[idx]}
          poster={VIDEOS[idx].replace(".mp4", "-poster.webp")}
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="aspect-[540/736] w-full object-cover"
          aria-label={`${r.caption} — ${r.videos[idx]}`}
        />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          {r.badge}
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? r.pause : r.play}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {playing ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
      </div>
      <figcaption className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[13px] text-white/60">{r.caption}</span>
        <span className="flex gap-1.5" role="group" aria-label={r.badge}>
          {r.videos.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setIdx(i)}
              aria-pressed={idx === i}
              className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                idx === i ? "bg-white text-ink" : "border border-white/20 text-white/80 hover:border-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
