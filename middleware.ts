import { NextRequest, NextResponse } from "next/server";
import {
  countryToLocale,
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_SOURCE_COOKIE,
  locales,
  type Locale,
} from "./i18n/config";

/**
 * Locale resolution order for a visitor who lands on a URL without a locale:
 *   1. Language the visitor chose manually (cookie)  → never overridden
 *   2. Country from the hosting platform's geo header (server-side IP geolocation)
 *   3. Optional external geolocation service (GEOIP_API_URL), 800 ms timeout
 *   4. Browser Accept-Language
 *   5. English
 * URLs that already contain a locale (/lt, /de, /en) are always respected.
 */

const GEO_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
  "x-appengine-country",
];

function countryFromHeaders(req: NextRequest): string | null {
  for (const h of GEO_HEADERS) {
    const v = req.headers.get(h);
    if (v && /^[A-Za-z]{2}$/.test(v) && v.toUpperCase() !== "XX") return v.toUpperCase();
  }
  return null;
}

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

async function countryFromService(req: NextRequest): Promise<string | null> {
  const tpl = process.env.GEOIP_API_URL;
  const ip = clientIp(req);
  if (!tpl || !ip || ip === "127.0.0.1" || ip === "::1") return null;
  try {
    const url = tpl.includes("{ip}") ? tpl.replace("{ip}", encodeURIComponent(ip)) : tpl + encodeURIComponent(ip);
    const res = await fetch(url, { signal: AbortSignal.timeout(800), headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const c = data.country_code ?? data.countryCode ?? data.country;
    return typeof c === "string" && /^[A-Za-z]{2}$/.test(c) ? c.toUpperCase() : null;
  } catch {
    return null;
  }
}

function localeFromAcceptLanguage(req: NextRequest): Locale | null {
  const header = req.headers.get("accept-language");
  if (!header) return null;
  const prefs = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const p of prefs) if (isLocale(p.lang)) return p.lang;
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  let locale: Locale | null = null;
  let source = "auto";

  const manual = req.cookies.get(LOCALE_SOURCE_COOKIE)?.value === "manual";
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (manual && isLocale(cookieLocale)) {
    locale = cookieLocale;
    source = "manual";
  }

  if (!locale) {
    const country = countryFromHeaders(req) ?? (await countryFromService(req));
    if (country) locale = countryToLocale[country] ?? "en";
  }
  if (!locale) locale = localeFromAcceptLanguage(req);
  if (!locale) locale = defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Cookie, Accept-Language");
  if (source !== "manual") {
    res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  return res;
}

export const config = {
  // Skip API, Next internals, static files and the internal render route
  matcher: ["/((?!api|_next|render|models|images|favicon|icon|apple-icon|robots.txt|sitemap.xml|.*\\..*).*)"],
};

