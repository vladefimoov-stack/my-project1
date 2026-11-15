import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { LegalPage, legalMetadata } from "@/components/sections/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? legalMetadata(locale, "privacy") : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="privacy" />;
}
