"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { product } from "@/config/product";
import renders from "@/lib/render-manifest.json";
import type { ViewId } from "@/lib/views";
import type { ViewRequest, ZoomRequest } from "./ViewerCanvas";
import type { AppId } from "@/lib/apps";
import { launcherDate } from "@/lib/launcher";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

const PRESETS: { id: ViewId; key: "front" | "keypad" | "back" | "side" | "edges" }[] = [
  { id: "front", key: "front" },
  { id: "keypad", key: "keypad" },
  { id: "back", key: "back" },
  { id: "side", key: "side" },
  { id: "edges", key: "edges" },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/85 text-ink backdrop-blur transition-colors hover:border-ink";

/**
 * Interactive 3D model shown directly in the hero.
 * The studio render is the poster (fast first paint / LCP) and is replaced by
 * the live WebGL model as soon as it is ready. Static render if no WebGL.
 */
export function HeroViewer() {
  const { dict, locale } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(true);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [request, setRequest] = useState<ViewRequest>({ id: "hero", nonce: 0 });
  const [zoom, setZoom] = useState<ZoomRequest>({ dir: 1, nonce: 0 });
  const [active, setActive] = useState<ViewId | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fs, setFs] = useState(false);
  const labels = dict.demo.apps as Record<AppId, string>;
  const [date, setDate] = useState<string>();
  useEffect(() => setDate(launcherDate(locale)), [locale]);

  useEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    if (!ok) return;
    // load the 3D bundle right after first paint so the poster stays the LCP
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setMount(true), { timeout: 1200 });
    else setTimeout(() => setMount(true), 300);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
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
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
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
    if (document.fullscreenElement) return void (await document.exitFullscreen().catch(() => {}));
    if (fs) return setFs(false); // CSS fallback (iOS Safari)
    try {
      if (el.requestFullscreen) return void (await el.requestFullscreen());
    } catch {
      /* fall through */
    }
    setFs(true);
  };

  const live = webgl && mount;

  return (
    <div className="w-full">
      <div
        ref={wrap}
        className={
          fs
            ? "fixed inset-0 z-[60] bg-gradient-to-b from-white to-mist"
            : "relative h-[min(62svh,520px)] w-full sm:h-[600px] lg:h-[min(76svh,720px)]"
        }
      >
        {/* poster: studio render of the same model */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={ready}
        >
          <Image
            src={`/images/renders/hero-${locale}.webp`}
            alt={`${product.name} — ${dict.purchase.description}`}
            width={renders[`hero-${locale}`].width}
            height={renders[`hero-${locale}`].height}
            priority
            fetchPriority="high"
            quality={70}
            sizes="(min-width: 1024px) 420px, 55vw"
            className="h-[86%] w-auto select-none object-contain"
            draggable={false}
          />
        </div>

        {live && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <ViewerCanvas
              request={request}
              autoRotate={autoRotate}
              active={visible}
              labels={labels}
              date={date}
              onInteract={onInteract}
              onReady={() => setTimeout(() => setReady(true), 150)}
              freeZoom={fs}
              zoom={zoom}
            />
          </div>
        )}

        {live && (
          <>
            <div className="absolute right-0 top-2 flex gap-2 sm:top-4">
              <button
                type="button"
                onClick={() => setAutoRotate((a) => !a)}
                aria-pressed={autoRotate}
                title={dict.viewer.autoRotate}
                aria-label={dict.viewer.autoRotate}
                className={autoRotate ? `${iconBtn} !border-ink !bg-ink !text-white` : iconBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />
                </svg>
              </button>
              <button type="button" onClick={reset} title={dict.viewer.reset} aria-label={dict.viewer.reset} className={iconBtn}>
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
                className={iconBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  {fs ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
                </svg>
              </button>
            </div>
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-2">
              {([1, -1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setZoom((z) => ({ dir, nonce: z.nonce + 1 }))}
                  aria-label={dir === 1 ? dict.viewer.zoomIn : dict.viewer.zoomOut}
                  title={dir === 1 ? dict.viewer.zoomIn : dict.viewer.zoomOut}
                  className={iconBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    {dir === 1 ? <path d="M12 5v14M5 12h14" /> : <path d="M5 12h14" />}
                  </svg>
                </button>
              ))}
            </div>
            {fs && (
              <div className="absolute inset-x-0 bottom-0 p-4">
                <PresetChips active={active} onPick={go} />
              </div>
            )}
          </>
        )}
      </div>

      {live && !fs && (
        <div className="mt-2">
          <PresetChips active={active} onPick={go} />
          <p className="mt-3 text-center text-[11px] leading-snug text-stone">
            {dict.viewer.hint}
          </p>
        </div>
      )}
    </div>
  );
}

function PresetChips({ active, onPick }: { active: ViewId | null; onPick: (id: ViewId) => void }) {
  const { dict } = useI18n();
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center" role="group" aria-label={dict.viewer.eyebrow}>
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={active === p.id}
          onClick={() => onPick(p.id)}
          className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors ${
            active === p.id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
          }`}
        >
          {dict.viewer.views[p.key]}
        </button>
      ))}
    </div>
  );
}
