"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import { product, type FeatureKey } from "@/config/product";

const ICONS: Record<FeatureKey, React.ReactNode> = {
  compact: <path d="M8 2.5h8a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2zM10 18.5h4" />,
  keypad: (
    <>
      <rect x="4" y="4" width="4" height="4" rx="1" />
      <rect x="10" y="4" width="4" height="4" rx="1" />
      <rect x="16" y="4" width="4" height="4" rx="1" />
      <rect x="4" y="10" width="4" height="4" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <rect x="16" y="10" width="4" height="4" rx="1" />
      <rect x="4" y="16" width="4" height="4" rx="1" />
      <rect x="10" y="16" width="4" height="4" rx="1" />
      <rect x="16" y="16" width="4" height="4" rx="1" />
    </>
  ),
  touch: <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.6 15.5a1.5 1.5 0 0 1 2.3-1.9L9 16V11" />,
  hybrid: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M6 12h12M9.5 15h1M13.5 15h1M9.5 18h1M13.5 18h1" />
    </>
  ),
  apps: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  dualSim: (
    <>
      <path d="M4 6.5 6.5 4H11v9H4z" />
      <path d="M13 11.5 15.5 9H20v11h-7z" />
    </>
  ),
  lte: <path d="M4 18v-2M8 18v-5M12 18V9M16 18V6M20 18V3" />,
};

export function Features() {
  const { dict } = useI18n();
  return (
    <section id="features" aria-labelledby="features-title" className="bg-white py-24 sm:py-32">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{dict.features.eyebrow}</p>
          <h2 id="features-title" className="h-section mt-4">
            {dict.features.title}
          </h2>
        </Reveal>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {product.features.map((f, i) => {
            const item = dict.features.items[f.key];
            return (
              <Reveal as="li" key={f.key} delay={(i % 4) * 0.06} className="flex flex-col bg-white p-7 sm:p-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[f.key]}
                </svg>
                <h3 className="mt-8 text-[19px] font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{item.text}</p>
                {!f.confirmed && (
                  <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-stone">
                    <span className="h-1.5 w-1.5 rounded-full border border-stone" aria-hidden="true" />
                    {dict.features.pending}
                  </span>
                )}
              </Reveal>
            );
          })}
          <li className="hidden bg-mist lg:block" aria-hidden="true" />
        </ul>
      </div>
    </section>
  );
}
