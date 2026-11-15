"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_SOURCE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

export function persistManualLocale(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `${LOCALE_SOURCE_COOKIE}=manual; path=/; max-age=${maxAge}; samesite=lax`;
  try {
    localStorage.setItem("kl_locale", locale);
    localStorage.setItem("kl_locale_src", "manual");
  } catch {
    /* ignore */
  }
}

export function LanguageSwitcher({ dark = false, onChange }: { dark?: boolean; onChange?: () => void }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (l: Locale) => {
    persistManualLocale(l);
    setOpen(false);
    onChange?.();
    if (l === locale) return;
    const rest = pathname.replace(/^\/(en|lt|de)(?=\/|$)/, "");
    // full navigation so <html lang> and metadata update cleanly
    window.location.assign(`/${l}${rest}${window.location.hash}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${locale.toUpperCase()} — ${dict.nav.language}: ${localeNames[locale]}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-medium uppercase tracking-wide transition-colors ${
          dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-mist"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        {locale}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={dict.nav.language}
          className="absolute right-0 top-11 z-50 min-w-[160px] overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                lang={l}
                onClick={() => choose(l)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] text-ink hover:bg-mist ${
                  l === locale ? "font-semibold" : ""
                }`}
              >
                <span>{localeNames[l]}</span>
                <span className="text-[12px] uppercase text-stone">{l}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
