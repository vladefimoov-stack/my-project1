import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { CompanyDetails, legalMetadata } from "@/components/sections/LegalPage";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? legalMetadata(locale, "contact") : {};
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  return (
    <>
      <Header home={false} />
      <main id="main" className="container-site max-w-3xl pb-24 pt-32">
        <h1 className="text-[40px] font-semibold tracking-tightest sm:text-[52px]">{d.legal.contact.title}</h1>
        <p className="mt-6 text-[18px] leading-relaxed text-ink/70">{d.legal.contact.text}</p>
        {site.contactPhone && (
          <a
            href={`tel:${site.contactPhone.replace(/\s+/g, "")}`}
            className="group mt-10 flex items-center gap-5 rounded-[24px] border border-line p-6 transition-colors hover:border-ink sm:p-8"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.6 3.5c.5 0 .9.3 1.1.7l1.3 3c.2.5.1 1-.3 1.3L7.2 9.7a11 11 0 0 0 5.1 5.1l1.2-1.5c.3-.4.9-.5 1.3-.3l3 1.3c.5.2.8.7.7 1.2l-.3 2.6c-.1.6-.6 1-1.2 1C9.7 19 3.9 13.3 3.8 5.9c0-.6.4-1.1 1-1.2z" />
              </svg>
            </span>
            <span>
              <span className="block text-[13px] text-stone">{d.legal.contact.phone}</span>
              <span className="block text-[24px] font-semibold tracking-tight sm:text-[28px]">{site.contactPhone}</span>
              <span className="mt-1 block text-[13px] text-stone">{d.legal.contact.phoneNote}</span>
            </span>
          </a>
        )}
        <CompanyDetails locale={locale} />
      </main>
      <Footer />
    </>
  );
}
