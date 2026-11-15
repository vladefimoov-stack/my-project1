"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { APPS, type AppId } from "@/lib/apps";
import { DEVICE, KEY_GLYPHS, keypadLayout, type KeyId } from "@/lib/device";
import { PhoneContext, WALLPAPERS, type KeyHandler, type PhoneSettings } from "./context";
import { AppIcon } from "./AppIcon";
import { Messaging } from "./apps/Messaging";
import { Maps } from "./apps/Maps";
import { Gallery } from "./apps/Gallery";
import { Video } from "./apps/Video";
import { Music } from "./apps/Music";
import { Settings } from "./apps/Settings";
import { Dialer } from "./apps/Dialer";
import { Contacts } from "./apps/Contacts";

const { width: W, height: H } = DEVICE;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function StatusBar({ dark, time }: { dark: boolean; time: string }) {
  return (
    <div className={`flex h-[1.9em] shrink-0 items-center justify-between px-[0.9em] text-[0.78em] font-semibold ${dark ? "text-white" : "text-[#111]"}`}>
      <span className="tabular-nums">{time}</span>
      <span className="flex items-center gap-[0.35em]" aria-hidden="true">
        <svg viewBox="0 0 16 12" width="1.2em" height="0.9em" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx=".6" /><rect x="4.3" y="5.5" width="3" height="6.5" rx=".6" /><rect x="8.6" y="3" width="3" height="9" rx=".6" /><rect x="12.9" y="0" width="3" height="12" rx=".6" />
        </svg>
        <svg viewBox="0 0 16 12" width="1.2em" height="0.9em" fill="currentColor">
          <path d="M8 2.2c2.4 0 4.6.9 6.3 2.4l1.2-1.3A11 11 0 0 0 8 .4 11 11 0 0 0 .5 3.3l1.2 1.3A9.2 9.2 0 0 1 8 2.2zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3A7.4 7.4 0 0 0 8 4a7.4 7.4 0 0 0-4.9 1.9l1.2 1.3c1-.9 2.3-1.4 3.7-1.4zM8 9.4c-.6 0-1.1.2-1.5.6L8 11.6l1.5-1.6c-.4-.4-.9-.6-1.5-.6z" />
        </svg>
        <span className="relative inline-block h-[0.85em] w-[1.6em] rounded-[0.25em] border border-current p-[0.1em]">
          <span className="block h-full w-[78%] rounded-[0.12em] bg-current" />
        </span>
      </span>
    </div>
  );
}

function Home({ focus, dark, onOpen, showFocus }: { focus: number; dark: boolean; onOpen: (id: AppId) => void; showFocus: boolean }) {
  const { dict } = useI18n();
  return (
    <div className="flex flex-1 flex-col px-[0.6em] pt-[0.7em]">
      <ul className="grid grid-cols-3 gap-y-[0.9em]">
        {APPS.map((a, i) => (
          <li key={a.id} className="flex justify-center">
            <button
              type="button"
              onClick={() => onOpen(a.id)}
              className={`group flex w-[6.6em] flex-col items-center gap-[0.35em] rounded-[1em] py-[0.25em] outline-none transition-colors ${
                showFocus && focus === i ? "bg-white/15" : ""
              }`}
            >
              <AppIcon id={a.id} className="h-[4.3em] w-[4.3em] drop-shadow-[0_0.15em_0.3em_rgba(0,0,0,0.35)] transition-transform duration-150 group-active:scale-90" />
              <span className={`max-w-full truncate text-[0.82em] font-medium ${dark ? "text-white/95" : "text-white"}`}>{dict.demo.apps[a.id]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex justify-center gap-[0.4em] pb-[0.8em]" aria-hidden="true">
        <span className="h-[0.35em] w-[0.35em] rounded-full bg-white/90" />
        <span className="h-[0.35em] w-[0.35em] rounded-full bg-white/35" />
      </div>
    </div>
  );
}

function AppView({ id }: { id: AppId }) {
  switch (id) {
    case "telegram":
      return <Messaging variant="telegram" />;
    case "whatsapp":
      return <Messaging variant="whatsapp" />;
    case "maps":
      return <Maps />;
    case "gallery":
      return <Gallery />;
    case "youtube":
      return <Video />;
    case "music":
      return <Music />;
    case "settings":
      return <Settings />;
    case "phone":
      return <Dialer />;
    case "contacts":
      return <Contacts />;
  }
}

/* ──────────────────────────── Keypad ──────────────────────────── */

function KeyLabel({ main, sub, icon }: { main: string; sub?: string; icon?: keyof typeof KEY_GLYPHS }) {
  if (icon)
    return (
      <svg viewBox="0 0 24 24" className="h-[52%] w-auto" fill="#D9DADE" aria-hidden="true">
        <path d={KEY_GLYPHS[icon]} fillRule="evenodd" />
      </svg>
    );
  return (
    <span className="flex items-baseline gap-[0.18em] text-[#D9DADE]" aria-hidden="true">
      <span className="text-[1.45em] font-light leading-none">{main}</span>
      {sub && <span className="text-[0.55em] font-semibold tracking-wide">{sub}</span>}
    </span>
  );
}

const KEY_NAMES: Partial<Record<KeyId, string>> = {
  softL: "Clock", softR: "Back", call: "Call", end: "Home / end call",
  up: "Up", down: "Down", left: "Left", right: "Right", ok: "OK",
};

/* ──────────────────────────── Phone ──────────────────────────── */

export function VirtualPhone() {
  const { dict, locale } = useI18n();
  const reduce = useReducedMotion();
  const layout = useMemo(() => keypadLayout(), []);
  const [app, setApp] = useState<AppId | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const [showFocus, setShowFocus] = useState(false);
  const [clock, setClock] = useState(false);
  const [flash, setFlash] = useState<KeyId | null>(null);
  const [settings, setSettingsState] = useState<PhoneSettings>({
    dark: true,
    largeText: false,
    sounds: false,
    brightness: 1,
    wallpaper: "night",
  });
  const handlerRef = useRef<KeyHandler | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const now = useClock();
  const tag = locale === "lt" ? "lt-LT" : locale === "de" ? "de-DE" : "en-GB";
  const time = now ? now.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" }) : "12:48";

  const setSettings = useCallback((p: Partial<PhoneSettings>) => setSettingsState((s) => ({ ...s, ...p })), []);

  const beep = useCallback(
    (freq = 700) => {
      if (!settings.sounds) return;
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = audio.current ?? new Ctx();
        audio.current = ctx;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.04, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.09);
      } catch {
        /* audio unavailable */
      }
    },
    [settings.sounds]
  );

  const open = useCallback((id: AppId, p?: string) => {
    setPayload(p ?? null);
    setApp(id);
    setClock(false);
  }, []);
  const goHome = useCallback(() => {
    setApp(null);
    setPayload(null);
  }, []);

  const press = useCallback(
    (k: KeyId) => {
      setFlash(k);
      setTimeout(() => setFlash((f) => (f === k ? null : f)), 140);
      beep(k === "ok" ? 900 : 700);
      if (clock) {
        setClock(false);
        return;
      }
      if (app && handlerRef.current?.(k)) return;
      if (k === "end") return goHome();
      if (k === "softL") return setClock(true);
      if (k === "call") return open("phone");
      if (app) {
        if (k === "softR") goHome();
        return;
      }
      // home screen navigation
      if (/^[0-9*#]$/.test(k)) return open("phone", k);
      setShowFocus(true);
      if (k === "left") setFocus((f) => (f + 8) % 9);
      if (k === "right") setFocus((f) => (f + 1) % 9);
      if (k === "up") setFocus((f) => (f + 6) % 9);
      if (k === "down") setFocus((f) => (f + 3) % 9);
      if (k === "ok") open(APPS[focus].id);
    },
    [app, beep, clock, focus, goHome, open]
  );

  // keyboard support while the phone has focus
  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, KeyId> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      Enter: "ok", Backspace: "softR", Escape: "softR", Home: "end",
    };
    const k = map[e.key] ?? (/^[0-9*#]$/.test(e.key) ? (e.key as KeyId) : null);
    if (!k) return;
    if (e.target instanceof HTMLButtonElement && e.key === "Enter") return; // let buttons click
    e.preventDefault();
    press(k);
  };

  const ctx = useMemo(
    () => ({ settings, setSettings, open, goHome, payload, beep, handlerRef, press }),
    [settings, setSettings, open, goHome, payload, beep, press]
  );

  const screen = DEVICE.screen;
  const glass = DEVICE.glass;
  const dpad = DEVICE.dpad;
  const keyCls = (id: KeyId) =>
    `vk absolute flex items-center justify-center rounded-[6%/12%] bg-gradient-to-b from-[#45464C] to-[#36373C] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_1px_rgba(0,0,0,0.5)] transition-[filter,transform] duration-75 outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
      flash === id ? "brightness-125 translate-y-px" : ""
    }`;

  return (
    <PhoneContext.Provider value={ctx}>
      <div
        ref={rootRef}
        onKeyDown={onKeyDown}
        className="relative mx-auto w-[min(300px,76vw)] select-none [container-type:inline-size]"
        style={{ aspectRatio: `${W} / ${H}` }}
        role="application"
        aria-roledescription="Interactive phone simulation"
        aria-label={`${dict.demo.title} — ${dict.common.simulation}`}
      >
        {/* body */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#3A3B40] via-[#2B2C30] to-[#1E1F22] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55),inset_0_0_0_1.5px_rgba(255,255,255,0.08),inset_0_2px_3px_rgba(255,255,255,0.12)]"
          style={{ borderRadius: `${(DEVICE.cornerRadius / W) * 100}% / ${(DEVICE.cornerRadius / H) * 100}%` }}
        />
        {/* glass */}
        <div
          className="absolute bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          style={{
            left: pct((W - glass.width) / 2, W),
            width: pct(glass.width, W),
            top: pct(glass.top, H),
            height: pct(glass.height, H),
            borderRadius: `${((DEVICE.cornerRadius - 2.4) / glass.width) * 100}% ${((DEVICE.cornerRadius - 2.4) / glass.width) * 100}% 3% 3% / ${((DEVICE.cornerRadius - 2.4) / glass.height) * 100}% ${((DEVICE.cornerRadius - 2.4) / glass.height) * 100}% 2% 2%`,
          }}
        >
          <span className="absolute left-1/2 top-[3.4%] h-[1.3%] w-[18%] -translate-x-1/2 rounded-full bg-[#1a1a1d]" aria-hidden="true" />
        </div>
        {/* screen */}
        <div
          className="absolute overflow-hidden [container-type:inline-size]"
          style={{
            left: pct((W - screen.width) / 2, W),
            width: pct(screen.width, W),
            top: pct(screen.top, H),
            height: pct(screen.height, H),
            filter: settings.brightness < 1 ? `brightness(${settings.brightness})` : undefined,
          }}
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden font-sans"
            style={{ fontSize: `calc(100cqw / 24 * ${settings.largeText ? 1.12 : 1})`, background: WALLPAPERS[settings.wallpaper] }}
          >
            <StatusBar dark time={time} />
            <Home focus={focus} dark={settings.dark} onOpen={(id) => open(id)} showFocus={showFocus} />
            <AnimatePresence>
              {app && (
                <motion.div
                  key={app + (payload ?? "")}
                  className={`absolute inset-0 flex flex-col ${settings.dark ? "bg-[#0F1013]" : "bg-[#F4F5F7]"}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, borderRadius: "1.4em" }}
                  animate={{ opacity: 1, scale: 1, borderRadius: "0em" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StatusBar dark={settings.dark || app === "phone" && payload !== null} time={time} />
                  <div className="relative min-h-0 flex-1">
                    <AppView id={app} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {clock && (
                <motion.button
                  type="button"
                  onClick={() => setClock(false)}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 text-white backdrop-blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-[4.5em] font-extralight tabular-nums leading-none">{time}</span>
                  <span className="mt-[0.4em] text-[0.9em] text-white/60">
                    {now?.toLocaleDateString(tag, { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
            <span className="pointer-events-none absolute left-1/2 top-[0.4em] z-30 -translate-x-1/2 rounded-full bg-white/15 px-[0.5em] py-[0.1em] text-[0.6em] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
              {dict.demo.badge}
            </span>
          </div>
        </div>
        {/* keypad */}
        <div
          className="absolute rounded-[3%/6%] bg-[#0E0E10]"
          style={{
            left: pct(DEVICE.keypad.side - 0.7, W),
            width: pct(W - DEVICE.keypad.side * 2 + 1.4, W),
            top: pct(DEVICE.keypad.top - 0.8, H),
            height: pct(layout.top - layout.bottom + 1.6, H),
            borderBottomLeftRadius: "14% 9%",
            borderBottomRightRadius: "14% 9%",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 [&_button]:pointer-events-auto" style={{ fontSize: "calc(100cqw / 22)" }}>
          {layout.keys.map((k) => (
            <button
              key={k.def.id}
              type="button"
              aria-label={KEY_NAMES[k.def.id] ?? k.def.main}
              onClick={() => press(k.def.id)}
              className={keyCls(k.def.id)}
              style={{
                left: pct(k.x - k.w / 2 + W / 2, W),
                top: pct(H / 2 - (k.y + k.h / 2), H),
                width: pct(k.w, W),
                height: pct(k.h, H),
              }}
            >
              <KeyLabel main={k.def.main} sub={k.def.sub} icon={k.def.icon} />
            </button>
          ))}
          {/* D-pad */}
          <div
            className="absolute rounded-full bg-gradient-to-b from-[#45464C] to-[#323337] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.6)]"
            style={{
              left: pct(W / 2 - dpad.outer, W),
              top: pct(H / 2 - layout.dpadY - dpad.outer, H),
              width: pct(dpad.outer * 2, W),
              height: pct(dpad.outer * 2, H),
            }}
          >
            {(
              [
                ["up", "left-1/4 top-0 h-1/3 w-1/2"],
                ["down", "bottom-0 left-1/4 h-1/3 w-1/2"],
                ["left", "left-0 top-1/4 h-1/2 w-1/3"],
                ["right", "right-0 top-1/4 h-1/2 w-1/3"],
              ] as [KeyId, string][]
            ).map(([id, pos]) => (
              <button
                key={id}
                type="button"
                aria-label={KEY_NAMES[id]}
                onClick={() => press(id)}
                className={`absolute ${pos} rounded-full outline-none transition-colors focus-visible:bg-white/10 active:bg-white/10 ${flash === id ? "bg-white/10" : ""}`}
              >
                <span
                  className="absolute left-1/2 top-1/2 h-[0.3em] w-[0.3em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
                  aria-hidden="true"
                />
              </button>
            ))}
            <button
              type="button"
              aria-label={KEY_NAMES.ok}
              onClick={() => press("ok")}
              className={`vk absolute left-1/2 top-1/2 h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#4A4B51] to-[#36373C] shadow-[0_0_0_0.18em_#1A1B1E,inset_0_1px_0_rgba(255,255,255,0.15)] outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                flash === "ok" ? "brightness-125" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </PhoneContext.Provider>
  );
}
