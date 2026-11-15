"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";

const PHOTOS = ["beach-launcher", "beach-maps", "beach-camera", "city-launcher", "city-maps", "city-camera"];

export function RealPhotos() {
  const { dict } = useI18n();
  const g = dict.gallery;
  return (
    <section id="real" aria-labelledby="real-title" className="bg-white py-24 sm:py-32">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{g.eyebrow}</p>
          <h2 id="real-title" className="h-section mt-4">
            {g.title}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/70">{g.subtitle}</p>
        </Reveal>
        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
          {PHOTOS.map((p, i) => (
            <Reveal as="li" key={p} delay={(i % 3) * 0.07} className="w-[72%] shrink-0 snap-center sm:w-auto">
              <div className="relative aspect-[720/980] overflow-hidden rounded-[24px] bg-mist">
                <Image
                  src={`/images/real/${p}.webp`}
                  alt={`Keyline One — ${g.alts[i]}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 72vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
