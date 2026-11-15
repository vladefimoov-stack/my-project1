"use client";

import Image from "next/image";
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

  return (
    <section id="product" aria-label={p.front.title} className="bg-white py-24 sm:py-32">
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

    </section>
  );
}
