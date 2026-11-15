"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [
  // essentials: phone + message
  <path key="a" d="M7 3.5c.5 0 .9.3 1.1.7l1.2 2.8c.2.5.1 1-.3 1.3L7.7 9.6a10 10 0 0 0 4.7 4.7l1.3-1.3c.3-.4.9-.5 1.3-.3l2.8 1.2c.5.2.8.7.7 1.2l-.3 2.4c-.1.6-.6 1-1.2 1C9.8 18.4 4.6 13.2 4.5 6.3c0-.6.4-1.1 1-1.2z" />,
  // keypad
  <g key="b">
    <rect x="5" y="3" width="14" height="18" rx="2.5" />
    <path d="M5 11h14M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 17.5h.01M12 17.5h.01M15 17.5h.01" />
  </g>,
  // sun / life
  <g key="c">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </g>,
];

/** Visitor enters THEIR OWN screen time — no invented statistics. */
function ScreenTimeCalculator() {
  const { dict, locale } = useI18n();
  const c = dict.why.calc;
  const reduce = useReducedMotion();
  const [hours, setHours] = useState(4);
  const days = Math.round((hours * 365) / 24);
  const half = Math.round(days / 2);
  const tag = locale === "lt" ? "lt-LT" : locale === "de" ? "de-DE" : "en-GB";
  const h = hours.toLocaleString(tag, { maximumFractionDigits: 1 });

  return (
    <div className="rounded-[32px] bg-graphite p-7 text-white sm:p-10">
      <h3 className="text-[24px] font-semibold tracking-tight sm:text-[30px]">{c.title}</h3>
      <label htmlFor="screen-hours" className="mt-8 flex items-baseline justify-between gap-4 text-[14px] text-white/70">
        {c.label}
        <span className="text-[20px] font-semibold tabular-nums text-white">{fmt(c.hours, { h })}</span>
      </label>
      <input
        id="screen-hours"
        type="range"
        min={0.5}
        max={10}
        step={0.5}
        value={hours}
        onChange={(e) => setHours(Number(e.target.value))}
        className="mt-4 w-full accent-white"
        aria-valuetext={fmt(c.hours, { h })}
      />
      <div className="mt-2 flex justify-between text-[12px] text-white/50" aria-hidden="true">
        <span>0,5</span>
        <span>10</span>
      </div>
      <div className="mt-10 border-t border-white/10 pt-8" aria-live="polite">
        <motion.p
          key={days}
          initial={reduce ? false : { opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-[44px] font-semibold leading-none tracking-tightest tabular-nums sm:text-[64px]"
        >
          {fmt(c.days, { days })}
        </motion.p>
        <p className="mt-3 text-[15px] text-white/60">{c.daysSub}</p>
        <p className="mt-8 text-[17px] font-medium leading-relaxed">{fmt(c.half, { days: half })}</p>
      </div>
      <p className="mt-8 text-[12px] leading-relaxed text-white/60">{c.note}</p>
    </div>
  );
}

export function Why() {
  const { dict } = useI18n();
  const w = dict.why;
  return (
    <section id="why" aria-labelledby="why-title" className="bg-white py-24 sm:py-32">
      <div className="container-site">
        <Reveal className="max-w-4xl">
          <p className="eyebrow">{w.eyebrow}</p>
          <h2 id="why-title" className="h-section mt-4">
            {w.title}
          </h2>
          <p className="mt-8 max-w-2xl text-[19px] leading-relaxed text-ink/70 sm:text-[21px]">{w.intro}</p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {w.points.map((pt, i) => (
              <Reveal as="li" key={pt.title} delay={i * 0.08} className="flex gap-5 py-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden="true">
                  {ICONS[i]}
                </svg>
                <div>
                  <h3 className="text-[20px] font-semibold tracking-tight">{pt.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink/65">{pt.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.1}>
            <ScreenTimeCalculator />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
