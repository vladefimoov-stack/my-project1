"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/dictionaries";
import { useKeys } from "../context";
import { MOUNTAINS, SCENES } from "../data";
import { AppBar, useTheme } from "./Shell";

export function Photo({ i, className = "" }: { i: number; className?: string }) {
  const withMountains = i % 3 !== 1;
  return <div className={className} style={{ background: withMountains ? `${MOUNTAINS}, ${SCENES[i % SCENES.length]}` : SCENES[i % SCENES.length] }} />;
}

export function Gallery() {
  const { dict } = useI18n();
  const t = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const n = SCENES.length;

  useKeys((k) => {
    if (open !== null) {
      if (k === "softR") return setOpen(null), true;
      if (k === "left") return setOpen((o) => ((o ?? 0) + n - 1) % n), true;
      if (k === "right" || k === "ok") return setOpen((o) => ((o ?? 0) + 1) % n), true;
      return false;
    }
    if (k === "left") return setFocus((f) => Math.max(0, f - 1)), true;
    if (k === "right") return setFocus((f) => Math.min(n - 1, f + 1)), true;
    if (k === "up") return setFocus((f) => Math.max(0, f - 3)), true;
    if (k === "down") return setFocus((f) => Math.min(n - 1, f + 3)), true;
    if (k === "ok") return setOpen(focus), true;
    return false;
  });

  return (
    <div className={`relative flex h-full flex-col ${t.bg} ${t.text}`}>
      <AppBar title={dict.demo.gallery.title} sub={fmt(dict.demo.gallery.count, { count: n })} />
      <div className="no-scrollbar grid flex-1 grid-cols-3 content-start gap-[2px] overflow-y-auto">
        {SCENES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Photo ${i + 1}`}
            className={`relative aspect-square overflow-hidden ${focus === i ? "ring-2 ring-inset ring-[#2F7BF6]" : ""}`}
          >
            <Photo i={i} className="absolute inset-0 transition-transform active:scale-95" />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col bg-black text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.22 }}
          >
            <AppBar title={`${open + 1} / ${n}`} />
            <motion.div
              key={open}
              className="relative flex-1"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) setOpen((o) => ((o ?? 0) + 1) % n);
                if (info.offset.x > 40) setOpen((o) => ((o ?? 0) + n - 1) % n);
              }}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
            >
              <Photo i={open} className="absolute inset-x-0 top-1/2 aspect-[4/3] -translate-y-1/2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
