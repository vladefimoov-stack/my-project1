import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { htmlLang, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { CartProvider } from "@/components/layout/CartProvider";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { LocaleSync } from "@/components/layout/LocaleSync";
import { site } from "@/config/site";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.title, template: `%s — Kalm` },
    description: d.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", lt: "/lt", de: "/de", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "Kalm",
      title: d.meta.title,
      description: d.meta.description,
      locale: locale === "lt" ? "lt_LT" : locale === "de" ? "de_DE" : "en_GB",
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Kalm" }],
    },
    twitter: { card: "summary_large_image", title: d.meta.title, description: d.meta.description, images: ["/images/og.jpg"] },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <html lang={htmlLang[locale as Locale]} className={inter.variable}>
      <body className="font-sans">
        <I18nProvider locale={locale as Locale} dict={dict}>
          <CartProvider>
            <LocaleSync />
            {children}
            <CheckoutDialog />
            <CookieNotice />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
