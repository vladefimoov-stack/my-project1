import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { fmt, getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";

const LAST_UPDATED = "2026-11-15";

/** Seller / controller details — only the fields filled in config/site.ts are shown. */
export function CompanyDetails({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).legal.company;
  const rows: [string, string][] = (
    [
      [d.name, site.legalEntity.name],
      [d.code, site.legalEntity.companyCode],
      [d.vat, site.legalEntity.vatNo],
      [d.address, site.legalEntity.address],
      [d.email, site.contactEmail],
    ] as [string, string][]
  ).filter(([, v]) => v);
  return (
    <dl className="mt-8 grid gap-x-8 gap-y-2 rounded-2xl bg-mist p-5 text-[14px] sm:grid-cols-[auto_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-stone">{k}</dt>
          <dd className="font-medium">{k === d.email ? <a href={`mailto:${v}`} className="link-underline">{v}</a> : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalPage({ locale, kind }: { locale: Locale; kind: "privacy" | "terms" | "shipping" }) {
  const d = getDictionary(locale);
  const page = d.legal[kind];
  const vars = { entity: site.legalEntity.name, days: site.dataRetentionDays };
  return (
    <>
      <Header home={false} />
      <main id="main" className="container-site max-w-3xl pb-24 pt-32">
        <h1 className="text-[40px] font-semibold tracking-tightest sm:text-[52px]">{page.title}</h1>
        <p className="mt-2 text-[13px] text-stone">
          {d.legal.updated}: {LAST_UPDATED}
        </p>
        {kind !== "shipping" && <CompanyDetails locale={locale} />}
        <div className="mt-10 space-y-10">
          {page.sections.map((s, i) => (
            <section key={s.h}>
              <h2 className="text-[20px] font-semibold tracking-tight">
                {kind === "terms" ? `${i + 1}. ` : ""}
                {s.h}
              </h2>
              {s.p.split("\n").map((para, j) => (
                <p key={j} className="mt-3 text-[16px] leading-relaxed text-ink/75">
                  {fmt(para, vars)}
                </p>
              ))}
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
