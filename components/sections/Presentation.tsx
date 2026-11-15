"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import { product } from "@/config/product";

function Render({ src, alt, className = "", sizes }: { src: string; alt: string; className?: string; sizes: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image src={`/images/renders/${src}.webp`} alt={alt} fill sizes={sizes} className="object-contain" />
    </div>
  );
}

export function Presentation() {
  const { dict } = useI18n();
  const p = dict.presentation;
  const reduce = useReducedMotion();
  const backRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: backRef, offset: ["start end", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);
  const backY2 = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 120, reduce ? 0 : -40]);

  return (
    <section id="product" aria-labelledby="concept-title" className="bg-white">
      {/* Intro */}
      <div className="container-site py-24 sm:py-36">
        <Reveal className="max-w-4xl">
          <p className="eyebrow">{p.eyebrow}</p>
          <h2 id="concept-title" className="h-section mt-4">
            {p.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 max-w-2xl">
          <p className="text-[19px] leading-relaxed text-ink/70 sm:text-[21px]">{p.intro}</p>
        </Reveal>
      </div>

      {/* Front — two ways to control */}
      <div className="container-site">
        <div className="grid items-center gap-10 rounded-[32px] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-2 lg:py-20">
          <Reveal>
            <h3 className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">{p.front.title}</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink/70">{p.front.text}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Render src="front" alt={`${product.name} — ${p.front.title}`} className="mx-auto aspect-[9/13] w-full max-w-[360px]" sizes="(min-width:1024px) 360px, 80vw" />
          </Reveal>
        </div>
      </div>

      {/* Display + keypad close-ups */}
      <div className="container-site mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal className="overflow-hidden rounded-[32px] bg-graphite text-white">
          <Render src="screenClose" alt={`${product.name} — ${p.display.title}`} className="aspect-[6/5] w-full" sizes="(min-width:1024px) 600px, 100vw" />
          <div className="px-6 pb-10 sm:px-10">
            <h3 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">{p.display.title}</h3>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-white/65">{p.display.text}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="overflow-hidden rounded-[32px] bg-graphite text-white">
          <Render src="keypadClose" alt={`${product.name} — ${p.keypad.title}`} className="aspect-[6/5] w-full" sizes="(min-width:1024px) 600px, 100vw" />
          <div className="px-6 pb-10 sm:px-10">
            <h3 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">{p.keypad.title}</h3>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-white/65">{p.keypad.text}</p>
          </div>
        </Reveal>
      </div>

      {/* Back — parallax pair */}
      <div ref={backRef} className="container-site mt-6">
        <div className="grid items-center gap-8 overflow-hidden rounded-[32px] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <h3 className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">{p.back.title}</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink/70">{p.back.text}</p>
          </Reveal>
          <div className="relative grid grid-cols-2 items-center gap-2">
            <motion.div style={{ y: backY }}>
              <Render src="back" alt={`${product.name} — ${p.back.title}`} className="aspect-[9/13] w-full" sizes="(min-width:1024px) 300px, 45vw" />
            </motion.div>
            <motion.div style={{ y: backY2 }}>
              <Render src="threeQuarterBack" alt="" className="aspect-[10/13] w-full" sizes="(min-width:1024px) 300px, 45vw" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="container-site mt-6">
        <div className="grid items-center gap-8 rounded-[32px] border border-line px-6 py-14 sm:px-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="order-2 lg:order-1">
            <figure>
              <Render src="scale" alt={`${product.name} — ${p.scale.card}`} className="mx-auto aspect-square w-full max-w-[460px]" sizes="(min-width:1024px) 460px, 90vw" />
              <figcaption className="mt-2 flex justify-center gap-8 text-[12px] text-stone">
                <span>{product.name}</span>
                <span>{p.scale.card} · 85.6 × 54 mm</span>
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <h3 className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">{p.scale.title}</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink/70">{p.scale.text}</p>
            <p className="mt-6 max-w-md text-[13px] leading-relaxed text-stone">{p.scale.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
