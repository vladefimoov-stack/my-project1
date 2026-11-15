"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { usePhone, useKeys, WALLPAPERS, type Wallpaper } from "../context";
import { AppBar, useTheme } from "./Shell";

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-[1.6em] w-[2.8em] shrink-0 rounded-full transition-colors ${on ? "bg-[#34C759]" : "bg-black/20"}`}
    >
      <span className={`absolute top-[0.15em] h-[1.3em] w-[1.3em] rounded-full bg-white shadow transition-[left] ${on ? "left-[1.35em]" : "left-[0.15em]"}`} />
    </button>
  );
}

export function Settings() {
  const { dict } = useI18n();
  const s = dict.demo.settings;
  const t = useTheme();
  const { settings, setSettings } = usePhone();
  const [about, setAbout] = useState(false);
  const [focus, setFocus] = useState(0);

  const rows: { key: string; label: string; act: () => void }[] = [
    { key: "dark", label: s.darkMode, act: () => setSettings({ dark: !settings.dark }) },
    { key: "large", label: s.largeText, act: () => setSettings({ largeText: !settings.largeText }) },
    { key: "sounds", label: s.sounds, act: () => setSettings({ sounds: !settings.sounds }) },
    { key: "about", label: s.about, act: () => setAbout((a) => !a) },
  ];

  useKeys((k) => {
    if (k === "up") return setFocus((f) => Math.max(0, f - 1)), true;
    if (k === "down") return setFocus((f) => Math.min(rows.length - 1, f + 1)), true;
    if (k === "ok") return rows[focus].act(), true;
    if (k === "left") return setSettings({ brightness: Math.max(0.5, settings.brightness - 0.1) }), true;
    if (k === "right") return setSettings({ brightness: Math.min(1, settings.brightness + 0.1) }), true;
    return false;
  });

  const row = `flex min-h-[3em] items-center justify-between gap-[0.6em] px-[0.9em] border-b ${t.line}`;
  const hl = (i: number) => (focus === i ? (t.dark ? "bg-white/5" : "bg-black/[0.03]") : "");

  return (
    <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
      <AppBar title={s.title} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-[0.7em] pb-[1em]">
        <div className={`overflow-hidden rounded-[1em] ${t.card}`}>
          <div className={`${row} ${hl(0)}`}>
            <span className="text-[0.95em]">{s.darkMode}</span>
            <Toggle on={settings.dark} onChange={rows[0].act} label={s.darkMode} />
          </div>
          <div className={`${row} ${hl(1)}`}>
            <span className="text-[0.95em]">{s.largeText}</span>
            <Toggle on={settings.largeText} onChange={rows[1].act} label={s.largeText} />
          </div>
          <div className={`${row} ${hl(2)} border-b-0`}>
            <span className="text-[0.95em]">{s.sounds}</span>
            <Toggle on={settings.sounds} onChange={rows[2].act} label={s.sounds} />
          </div>
        </div>

        <div className={`mt-[0.7em] rounded-[1em] px-[0.9em] py-[0.7em] ${t.card}`}>
          <label className="text-[0.95em]" htmlFor="vp-brightness">
            {s.brightness}
          </label>
          <input
            id="vp-brightness"
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={settings.brightness}
            onChange={(e) => setSettings({ brightness: Number(e.target.value) })}
            className="mt-[0.4em] w-full accent-[#2F7BF6]"
          />
        </div>

        <div className={`mt-[0.7em] rounded-[1em] px-[0.9em] py-[0.7em] ${t.card}`}>
          <div className="text-[0.95em]">{s.wallpaper}</div>
          <div className="mt-[0.5em] flex gap-[0.5em]">
            {(Object.keys(WALLPAPERS) as Wallpaper[]).map((w) => (
              <button
                key={w}
                type="button"
                aria-label={w}
                aria-pressed={settings.wallpaper === w}
                onClick={() => setSettings({ wallpaper: w })}
                className={`h-[3.6em] flex-1 rounded-[0.6em] ring-offset-2 transition-shadow ${settings.wallpaper === w ? "ring-2 ring-[#2F7BF6]" : ""}`}
                style={{ background: WALLPAPERS[w] }}
              />
            ))}
          </div>
        </div>

        <button type="button" onClick={rows[3].act} className={`mt-[0.7em] w-full rounded-[1em] px-[0.9em] py-[0.8em] text-left ${t.card} ${hl(3)}`}>
          <span className="flex items-center justify-between text-[0.95em]">
            {s.about}
            <span className={t.sub}>{about ? "−" : "+"}</span>
          </span>
          {about && (
            <span className={`mt-[0.4em] block text-[0.8em] leading-snug ${t.sub}`}>
              Keyline One · {dict.common.simulation}
              <br />
              {s.aboutText}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
