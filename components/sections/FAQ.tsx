"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";

export function FAQ() {
  const { dict } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-24 sm:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <p className="eyebrow">{dict.faq.eyebrow}</p>
          <h2 id="faq-title" className="h-section mt-4">
            {dict.faq.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="border-t border-line">
            {dict.faq.items.map((item, i) => {
              const isOpen = open === i;
              const bid = `${base}-b${i}`;
              const pid = `${base}-p${i}`;
              return (
                <li key={i} className="border-b border-line">
                  <h3>
                    <button
                      id={bid}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={pid}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-medium tracking-tight sm:text-[19px]"
                    >
                      {item.q}
                      <span className={`relative h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden="true">
                        <span className="absolute left-0 top-1/2 h-px w-4 bg-ink" />
                        <span className="absolute left-1/2 top-0 h-4 w-px bg-ink" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={pid}
                        role="region"
                        aria-labelledby={bid}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-ink/65">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
