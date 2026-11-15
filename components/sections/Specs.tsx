"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import { product, type SpecKey } from "@/config/product";

export function Specs() {
  const { dict } = useI18n();
  const keys = Object.keys(product.specs) as SpecKey[];
  return (
    <section aria-labelledby="specs-title" className="bg-white py-24 sm:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <p className="eyebrow">{dict.specs.eyebrow}</p>
          <h2 id="specs-title" className="mt-4 text-[34px] font-semibold tracking-tight sm:text-[44px]">
            {dict.specs.title}
          </h2>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-stone">{dict.specs.note}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="divide-y divide-line border-y border-line">
            {keys.map((k) => {
              const spec = product.specs[k];
              const ok = spec.verified && spec.value;
              return (
                <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-4 py-4 sm:grid-cols-[1fr_2fr]">
                  <dt className="text-[15px] text-ink/70">{dict.specs.labels[k]}</dt>
                  <dd className={`text-[15px] ${ok ? "font-medium text-ink" : "text-stone"}`}>
                    {ok ? (
                      spec.value
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full border border-stone" aria-hidden="true" />
                        {dict.common.pending}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
