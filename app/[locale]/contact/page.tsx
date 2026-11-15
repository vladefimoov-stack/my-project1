import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { legalMetadata } from "@/components/sections/LegalPage";
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
        <dl className="mt-10 border-y border-line py-5">
          <dt className="text-[13px] text-stone">{d.legal.contact.email}</dt>
          <dd className="mt-1 text-[18px]">
            <a href={`mailto:${site.contactEmail}`} className="link-underline">
              {site.contactEmail}
            </a>
          </dd>
        </dl>
        <p className="mt-8 text-[13px] text-stone">
          {site.legalEntity.name} · {site.legalEntity.address}
        </p>
      </main>
      <Footer />
    </>
  );
}
