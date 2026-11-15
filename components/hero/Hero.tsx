"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice, product } from "@/config/product";
import renders from "@/lib/render-manifest.json";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { dict, locale } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const discY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const discScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15]);

  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: 0.15 + i * 0.09, ease },
        };

  return (
    <section ref={ref} className="relative overflow-hidden bg-white pt-16" aria-labelledby="hero-title">
      <div className="container-site grid min-h-[calc(100svh-64px)] items-center gap-6 pb-10 pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16">
        <div className="relative z-10 max-w-xl text-center lg:text-left">
          <motion.p className="eyebrow" {...item(0)}>
            {dict.hero.eyebrow}
          </motion.p>
          <h1 id="hero-title" className="h-display mt-5">
            <motion.span className="block" {...item(1)}>
              {dict.hero.title1}
            </motion.span>
            <motion.span className="block text-stone" {...item(2)}>
              {dict.hero.title2}
            </motion.span>
          </h1>
          <motion.p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-ink/70 lg:mx-0 lg:text-[19px]" {...item(3)}>
            {dict.hero.subtitle}
          </motion.p>
          <motion.div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start" {...item(4)}>
            <a href="#viewer" className="btn-primary w-full sm:w-auto">
              {dict.hero.ctaDiscover}
            </a>
            <a href="#demo" className="btn-secondary w-full sm:w-auto">
              {dict.hero.ctaDemo}
              <span aria-hidden="true">→</span>
            </a>
          </motion.div>
          <motion.div className="mt-8 flex items-baseline justify-center gap-3 lg:justify-start" {...item(5)}>
            <span className="text-[13px] text-stone">{dict.hero.priceLabel}</span>
            <span className="text-[28px] font-semibold tracking-tight">{formatPrice(product.price, locale)}</span>
          </motion.div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">
          <motion.div
            aria-hidden="true"
            style={{ y: discY, scale: discScale }}
            className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#EDEDED,#F5F5F5_60%,rgba(255,255,255,0)_100%)]"
          />
          <motion.div
            initial={reduce ? false : { y: 60, rotate: -2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1.3, delay: 0.1, ease }}
            className="relative mx-auto w-full [--hero-h:52svh] lg:[--hero-h:78svh]"
            style={{ y: phoneY, maxWidth: `calc(var(--hero-h) * ${(renders.hero.width / renders.hero.height).toFixed(4)})` }}
          >
            <Image
              src="/images/renders/hero.webp"
              alt={`${product.name} — ${dict.purchase.description}`}
              width={renders.hero.width}
              height={renders.hero.height}
              priority
              sizes="(min-width: 1024px) 440px, 60vw"
              quality={70}
              fetchPriority="high"
              className="h-auto w-full select-none"
              draggable={false}
            />
          </motion.div>
          <p className="absolute bottom-0 right-0 text-[11px] text-stone/80">{dict.hero.renderNote}</p>
        </div>
      </div>
    </section>
  );
}
