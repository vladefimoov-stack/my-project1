"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { AppId } from "@/lib/apps";
import type { KeyId } from "@/lib/device";

export type Wallpaper = "night" | "dawn" | "graphite";

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
  night: "radial-gradient(120% 80% at 10% 90%, rgba(64,140,255,.38), transparent 60%), linear-gradient(160deg,#0E1118,#1B2130)",
  dawn: "radial-gradient(100% 70% at 80% 10%, rgba(255,170,120,.55), transparent 60%), linear-gradient(170deg,#2B2440,#11131C)",
  graphite: "radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,.12), transparent 60%), linear-gradient(180deg,#26272B,#121214)",
};
