"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart, clampQty } from "@/components/layout/CartProvider";
import { formatPrice, product } from "@/config/product";

export function Purchase() {
  const { dict, locale } = useI18n();
  const p = dict.purchase;
  const { colour, setColour, openCheckout } = useCart();
  const [qty, setQty] = useState(1);
  const colourNames = p.colours as Record<string, string>;

  return (
    <section id="order" aria-labelledby="order-title" className="bg-mist py-24 sm:py-32">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-white">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={`/images/renders/threeQuarterFront-${locale}.webp`}
              alt={`${product.name} — ${colourNames[colour] ?? colour}`}
              fill
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-contain p-8"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow">{p.eyebrow}</p>
          <h2 id="order-title" className="mt-3 text-[40px] font-semibold tracking-tightest sm:text-[56px]">
            {product.name}
          </h2>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-ink/70">{p.description}</p>
          <p className="mt-6 text-[32px] font-semibold tracking-tight">{formatPrice(product.price, locale)}</p>
          <p className="text-[13px] text-stone">{dict.hero.priceLabel}</p>

          <fieldset className="mt-8">
            <legend className="text-[14px] font-medium">
              {p.colour}: <span className="font-normal text-stone">{colourNames[colour] ?? colour}</span>
            </legend>
            <div className="mt-3 flex gap-3">
              {product.colours.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColour(c.id)}
                  disabled={!c.available}
                  aria-pressed={colour === c.id}
                  aria-label={colourNames[c.id] ?? c.id}
                  className={`h-10 w-10 rounded-full border-2 p-1 transition-colors ${colour === c.id ? "border-ink" : "border-transparent hover:border-line"}`}
                >
                  <span className="block h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]" style={{ background: c.swatch }} />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8">
            <p className="text-[14px] font-medium">{p.quantity}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <QuantityStepper value={qty} onChange={(v) => setQty(clampQty(v))} labels={{ decrease: p.decrease, increase: p.increase, quantity: p.quantity }} />
              <button type="button" className="btn-primary h-12 flex-1 sm:flex-none sm:px-10" onClick={() => openCheckout(qty)}>
                {p.order}
              </button>
            </div>
          </div>

          <p className="mt-6 flex gap-2 rounded-2xl border border-line bg-white p-4 text-[13px] leading-relaxed text-ink/70">
            <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            {p.orderNotice}
          </p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {(["delivery", "returns", "warranty"] as const).map((k) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[140px_1fr]">
                <dt className="text-[14px] font-medium">{p[k].title}</dt>
                <dd className="text-[14px] text-stone">{p[k].text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
