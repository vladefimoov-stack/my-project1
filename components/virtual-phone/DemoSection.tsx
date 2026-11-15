"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";

const VirtualPhone = dynamic(() => import("./VirtualPhone").then((m) => m.VirtualPhone), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-[55/132] w-[min(300px,76vw)] animate-pulse rounded-[13%/5.3%] bg-white/5" />,
});

export function DemoSection() {
  const { dict } = useI18n();
  return (
    <section id="demo" aria-labelledby="demo-title" className="dark-section relative overflow-hidden bg-graphite py-24 text-white sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.07),transparent)]"
      />
      <div className="container-site relative grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr]">
        <Reveal className="text-center lg:text-left">
          <p className="eyebrow !text-white/50">{dict.demo.eyebrow}</p>
          <h2 id="demo-title" className="h-section mt-4">
            {dict.demo.title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/65 lg:mx-0">{dict.demo.subtitle}</p>
          <p className="mx-auto mt-6 hidden max-w-md text-[13px] text-white/60 lg:mx-0 lg:block">{dict.demo.keysHint}</p>
        </Reveal>

        <Reveal delay={0.1} y={40}>
          <VirtualPhone />
        </Reveal>

        <Reveal delay={0.2} className="mx-auto max-w-md lg:mx-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
              {dict.common.simulation}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-white/55">{dict.demo.disclaimer}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
