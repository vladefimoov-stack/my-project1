"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import { product, type Spec, type SpecKey } from "@/config/product";

export function Specs() {
  const { dict, locale } = useI18n();
  const rows = (Object.keys(product.specs) as SpecKey[])
    .map((k) => {
      const spec = product.specs[k] as Spec;
      if (!spec.verified || !spec.value) return null;
      const value = typeof spec.value === "string" ? spec.value : spec.value[locale];
      return { k, value };
    })
    .filter((r): r is { k: SpecKey; value: string } => r !== null);
  return (
    <section aria-labelledby="specs-title" className="bg-white py-24 sm:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <p className="eyebrow">{dict.specs.eyebrow}</p>
          <h2 id="specs-title" className="mt-4 text-[34px] font-semibold tracking-tight sm:text-[44px]">
            {dict.specs.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(({ k, value }) => (
              <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-4 py-4 sm:grid-cols-[1fr_2fr]">
                <dt className="text-[15px] text-ink/70">{dict.specs.labels[k]}</dt>
                <dd className="text-[15px] font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
