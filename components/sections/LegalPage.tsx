import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { fmt, getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";

const LAST_UPDATED = "2026-11-15";

export function LegalPage({ locale, kind }: { locale: Locale; kind: "privacy" | "terms" | "shipping" }) {
  const d = getDictionary(locale);
  const page = d.legal[kind];
  const vars = {
    entity: site.legalEntity.name,
    address: site.legalEntity.address,
    reg: site.legalEntity.registrationNo,
    vat: site.legalEntity.vatNo,
    email: site.contactEmail,
    days: site.dataRetentionDays,
  };
  return (
    <>
      <Header home={false} />
      <main id="main" className="container-site max-w-3xl pb-24 pt-32">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">{d.legal.draft}</p>
        <h1 className="mt-10 text-[40px] font-semibold tracking-tightest sm:text-[52px]">{page.title}</h1>
        <p className="mt-2 text-[13px] text-stone">
          {d.legal.updated}: {LAST_UPDATED}
        </p>
        <div className="mt-10 space-y-10">
          {page.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[20px] font-semibold tracking-tight">{s.h}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{fmt(s.p, vars)}</p>
            </section>
          ))}
        </div>
        <Link href={`/${locale}`} className="link-underline mt-16 inline-block text-[14px]">
          ← {d.legal.backHome}
        </Link>
      </main>
      <Footer />
    </>
  );
}

export function legalMetadata(locale: Locale, kind: "privacy" | "terms" | "shipping" | "contact") {
  const d = getDictionary(locale);
  return {
    title: d.legal[kind].title,
    alternates: {
      canonical: `/${locale}/${kind}`,
      languages: { en: `/en/${kind}`, lt: `/lt/${kind}`, de: `/de/${kind}` },
    },
  };
}
