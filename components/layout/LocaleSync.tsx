"use client";

import { useEffect } from "react";
import { LOCALE_COOKIE, LOCALE_SOURCE_COOKIE, isLocale } from "@/i18n/config";

/**
 * If the visitor chose a language manually earlier but the cookie is gone
 * (e.g. cleared), restore it from localStorage so the server-side
 * auto-detection never overrides the manual choice.
 */
export function LocaleSync() {
  useEffect(() => {
    try {
      const l = localStorage.getItem("kl_locale");
      const src = localStorage.getItem("kl_locale_src");
      if (src === "manual" && isLocale(l) && !document.cookie.includes(`${LOCALE_SOURCE_COOKIE}=manual`)) {
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${maxAge}; samesite=lax`;
        document.cookie = `${LOCALE_SOURCE_COOKIE}=manual; path=/; max-age=${maxAge}; samesite=lax`;
      }
    } catch {
      /* storage blocked */
    }
  }, []);
  return null;
}
