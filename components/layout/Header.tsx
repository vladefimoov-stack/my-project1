"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/dictionaries";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "./CartProvider";
import { formatPrice, product } from "@/config/product";

export function Header({ home = true }: { home?: boolean }) {
  const { dict, locale } = useI18n();
  const { bagCount, openCheckout } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const base = home ? "" : `/${locale}`;
  const links = [
    { href: `${base}#why`, label: dict.nav.why },
    { href: `${base}#real`, label: dict.nav.product },
    { href: `${base}#demo`, label: dict.nav.demo },
    { href: `${base}#faq`, label: dict.nav.faq },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || menu ? "bg-white/80 shadow-[0_1px_0_#D8D8D8] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent"
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {dict.common.skip}
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="shrink-0" aria-label="Keyline — home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3.5 py-2 text-[14px] text-ink/80 transition-colors hover:bg-mist hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => openCheckout()} className="btn-primary mr-1 hidden h-9 px-4 text-[13px] md:inline-flex">
            {dict.nav.order} · {formatPrice(product.price, locale)}
          </button>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => openCheckout()}
            aria-label={bagCount ? fmt(dict.nav.bagItems, { count: bagCount }) : dict.nav.bag}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M5 8h14l-1.2 12H6.2z" strokeLinejoin="round" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            {bagCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                {bagCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist md:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? dict.common.close : dict.nav.menu}
            onClick={() => setMenu((m) => !m)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100dvh-64px)] bg-white md:hidden"
          >
            <ul className="container-site flex flex-col pt-4">
              {links.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <a href={l.href} onClick={() => setMenu(false)} className="block py-5 text-[28px] font-semibold tracking-tight">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-8">
                <button type="button" className="btn-primary w-full" onClick={() => { setMenu(false); openCheckout(); }}>
                  {dict.nav.order}
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
