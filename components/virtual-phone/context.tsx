"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { AppId } from "@/lib/apps";
import type { KeyId } from "@/lib/device";

export type Wallpaper = "wave" | "dawn" | "graphite";

export type PhoneSettings = {
  dark: boolean;
  largeText: boolean;
  sounds: boolean;
  brightness: number; // 0.5 – 1
  wallpaper: Wallpaper;
};

export type KeyHandler = (key: KeyId) => boolean; // return true when consumed

export type PhoneCtx = {
  settings: PhoneSettings;
  setSettings: (p: Partial<PhoneSettings>) => void;
  open: (app: AppId, payload?: string) => void;
  goHome: () => void;
  payload: string | null; // e.g. initial digits for the dialer, contact to call
  beep: (freq?: number) => void;
  handlerRef: React.MutableRefObject<KeyHandler | null>;
  press: (k: KeyId) => void;
};

export const PhoneContext = createContext<PhoneCtx | null>(null);

export function usePhone() {
  const c = useContext(PhoneContext);
  if (!c) throw new Error("usePhone outside VirtualPhone");
  return c;
}

/** Let the current app intercept hardware keys (back, digits, D-pad…). */
export function useKeys(handler: KeyHandler) {
  const { handlerRef } = usePhone();
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    const fn: KeyHandler = (k) => latest.current(k);
    handlerRef.current = fn;
    return () => {
      if (handlerRef.current === fn) handlerRef.current = null;
    };
  }, [handlerRef]);
}

export const WALLPAPERS: Record<Wallpaper, string> = {
  // blue "wave" wallpaper, like the real device's default
  wave:
    "radial-gradient(70% 45% at 85% 15%, rgba(140,170,255,.45), transparent 70%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 124' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='w' x1='0.3' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%233D63F0'/%3E%3Cstop offset='1' stop-color='%231C3CC4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M42 0C20 31 75 50 48 77C25 99 55 118 50 124H100V0Z' fill='url(%23w)'/%3E%3C/svg%3E\") center/100% 100% no-repeat, linear-gradient(135deg,#0A1A5C,#122B8F)",
  dawn: "radial-gradient(100% 70% at 80% 10%, rgba(255,170,120,.55), transparent 60%), linear-gradient(170deg,#2B2440,#11131C)",
  graphite: "radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,.12), transparent 60%), linear-gradient(180deg,#26272B,#121214)",
};
