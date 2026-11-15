import en from "@/locales/en.json";
import lt from "@/locales/lt.json";
import de from "@/locales/de.json";
import type { Locale } from "./config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, lt, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export { fmt } from "./fmt";
