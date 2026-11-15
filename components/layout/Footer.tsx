"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Logo } from "./Logo";

export function Footer() {
  const { dict, locale } = useI18n();
  const f = dict.footer;
  const year = new Date().getFullYear();
  const links = [
    { href: `/${locale}#product`, label: f.product },
    { href: `/${locale}/contact`, label: f.contact },
    { href: `/${locale}#faq`, label: f.faq },
    { href: `/${locale}/privacy`, label: f.privacy },
    { href: `/${locale}/terms`, label: f.terms },
    { href: `/${locale}/shipping`, label: f.shipping },
  ];
  return (
    <footer className="dark-section bg-graphite text-white">
      <div className="container-site py-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Logo inverted />
            <p className="mt-4 text-[14px] text-white/50">{f.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/60 sm:flex-row sm:justify-between">
          <p>
            © {year} Keyline. {f.rights}
          </p>
          <p className="max-w-lg sm:text-right">{f.testPhase}</p>
        </div>
      </div>
    </footer>
  );
}
