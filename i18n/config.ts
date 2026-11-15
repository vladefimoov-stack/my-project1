export const locales = ["en", "lt", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  lt: "Lietuvių",
  de: "Deutsch",
};

export const htmlLang: Record<Locale, string> = { en: "en", lt: "lt", de: "de" };

/** ISO country → locale. Everything not listed falls back to English. */
export const countryToLocale: Record<string, Locale> = {
  LT: "lt",
  DE: "de",
};

export const LOCALE_COOKIE = "kl_locale";
/** "manual" when the visitor picked a language themselves */
export const LOCALE_SOURCE_COOKIE = "kl_locale_src";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}
