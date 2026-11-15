"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/ui/Reveal";
import type { ViewId } from "@/lib/views";
import type { ViewRequest } from "./ViewerCanvas";
import type { AppId } from "@/lib/apps";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

const PRESETS: { id: ViewId; key: "front" | "keypad" | "back" | "side" | "edges" }[] = [
  { id: "front", key: "front" },
  { id: "keypad", key: "keypad" },
  { id: "back", key: "back" },
  { id: "side", key: "side" },
  { id: "edges", key: "edges" },
];

const FALLBACK = ["threeQuarterFront", "front", "back", "side", "keypadClose", "edges"];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function ViewerSection() {
  const { dict } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false); // mount 3D when approaching
  const [visible, setVisible] = useState(false); // render loop on/off
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [request, setRequest] = useState<ViewRequest>({ id: "hero", nonce: 0 });
  const [active, setActive] = useState<ViewId | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fs, setFs] = useState(false);

  const labels = dict.demo.apps as Record<AppId, string>;

  useEffect(() => {
    setWebgl(hasWebGL());
    const el = wrap.current;
    if (!el) return;
    const io1 = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    const io2 = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io1.observe(el);
    io2.observe(el);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);

  useEffect(() => {
    const on = () => setFs(document.fullscreenElement === wrap.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  useEffect(() => {
    if (!fs) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.fullscreenElement && setFs(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fs]);

  const go = (id: ViewId) => {
    setActive(id);
    setRequest((r) => ({ id, nonce: r.nonce + 1 }));
  };
  const reset = () => {
    setActive(null);
    setRequest((r) => ({ id: "hero", nonce: r.nonce + 1 }));
  };
  const onInteract = useCallback(() => setActive(null), []);

  const toggleFs = async () => {
    const el = wrap.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (fs) {
      setFs(false); // CSS fallback (iOS Safari has no element fullscreen)
      return;
    }
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        /* fall through to CSS fallback */
      }
    }
    setFs(true);
  };

  return (
    <section id="viewer" className="bg-mist py-24 sm:py-32" aria-labelledby="viewer-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{dict.viewer.eyebrow}</p>
          <h2 id="viewer-title" className="h-section mt-4">
            {dict.viewer.title}
          </h2>
          <p className="mt-5 text-[17px] text-ink/70">{dict.viewer.subtitle}</p>
        </Reveal>

        <div
          ref={wrap}
          className={`relative mt-12 overflow-hidden bg-gradient-to-b from-white to-mist ${
            fs ? "fixed inset-0 z-[60] mt-0 rounded-none" : "h-[520px] rounded-[28px] border border-line/70 sm:h-[640px]"
          }`}
        >
          {webgl === false ? (
            <div className="flex h-full flex-col">
              <p className="px-6 pt-6 text-center text-[14px] text-stone">{dict.viewer.noWebgl}</p>
              <div className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto p-6">
                {FALLBACK.map((v) => (
                  <div key={v} className="relative h-full min-w-[70%] snap-center sm:min-w-[40%]">
                    <Image src={`/images/renders/${v}.webp`} alt="" fill sizes="(min-width: 640px) 40vw, 70vw" className="object-contain" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {near && webgl && (
                <ViewerCanvas
                  request={request}
                  autoRotate={autoRotate}
                  active={visible}
                  labels={labels}
                  onInteract={onInteract}
                  onReady={() => setReady(true)}
                />
              )}
              {!ready && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" role="status">
                  <Image src="/images/renders/hero.webp" alt="" width={300} height={350} className="h-[60%] w-auto opacity-40 blur-[1px]" />
                  <span className="flex items-center gap-2 text-[13px] text-stone">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-ink" />
                    {dict.viewer.loading}
                  </span>
                </div>
              )}
            </>
          )}

          {webgl !== false && (
            <>
              <div className="pointer-events-none absolute left-1/2 top-4 hidden -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 sm:block text-[12px] text-stone backdrop-blur">
                {dict.viewer.hint}
              </div>
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRotate((a) => !a)}
                  aria-pressed={autoRotate}
                  title={dict.viewer.autoRotate}
                  aria-label={dict.viewer.autoRotate}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition-colors ${
                    autoRotate ? "border-ink bg-ink text-white" : "border-line bg-white/80 text-ink hover:border-ink"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={reset}
                  title={dict.viewer.reset}
                  aria-label={dict.viewer.reset}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink backdrop-blur hover:border-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggleFs}
                  title={fs ? dict.viewer.exitFullscreen : dict.viewer.fullscreen}
                  aria-label={fs ? dict.viewer.exitFullscreen : dict.viewer.fullscreen}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink backdrop-blur hover:border-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    {fs ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
                  </svg>
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                <div className="no-scrollbar mx-auto flex max-w-full gap-2 overflow-x-auto sm:justify-center" role="group" aria-label={dict.viewer.eyebrow}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active === p.id}
                      onClick={() => go(p.id)}
                      className={`h-10 shrink-0 rounded-full border px-4 text-[13px] font-medium backdrop-blur transition-colors ${
                        active === p.id ? "border-ink bg-ink text-white" : "border-line bg-white/85 text-ink hover:border-ink"
                      }`}
                    >
                      {dict.viewer.views[p.key]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[12px] leading-relaxed text-stone">{dict.viewer.provisional}</p>
      </div>
    </section>
  );
}
