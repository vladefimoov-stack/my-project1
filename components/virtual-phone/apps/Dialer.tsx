"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { usePhone, useKeys } from "../context";
import { CONTACTS } from "../data";
import { AppBar, useTheme } from "./Shell";

const PAD = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

export function Dialer() {
  const { dict } = useI18n();
  const p = dict.demo.phone;
  const t = useTheme();
  const { payload, beep } = usePhone();
  const contact = CONTACTS.find((c) => c.id === payload);
  const [num, setNum] = useState(() => (contact ? contact.phone : payload && /^[\d*#]+$/.test(payload) ? payload : ""));
  const [calling, setCalling] = useState<boolean>(!!contact);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!calling) return;
    setSecs(0);
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [calling]);

  const press = (d: string) => {
    if (calling) return;
    setNum((n) => (n + d).slice(0, 18));
    beep(600 + Number(d.replace(/\D/, "5")) * 40);
  };
  const call = () => num && setCalling(true);

  useKeys((k) => {
    if (/^[0-9*#]$/.test(k)) return press(k), true;
    if (k === "call" || k === "ok") return calling ? true : (call(), true);
    if (k === "end" && calling) return setCalling(false), true;
    if (k === "softR") {
      if (calling) return setCalling(false), true;
      if (num) return setNum((n) => n.slice(0, -1)), true;
    }
    return false;
  });

  const name = CONTACTS.find((c) => c.phone === num)?.name;

  if (calling) {
    return (
      <div className="flex h-full flex-col items-center bg-gradient-to-b from-[#1F2A37] to-[#0B0F14] px-[1em] pt-[3em] text-white">
        <div className="flex h-[4.5em] w-[4.5em] items-center justify-center rounded-full bg-white/10 text-[1.6em] font-semibold">
          {(name ?? "#")[0]}
        </div>
        <div className="mt-[0.8em] text-[1.3em] font-semibold">{name ?? num}</div>
        <div className="mt-[0.2em] text-[0.85em] text-white/60">
          {secs < 3 ? p.calling : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}
        </div>
        <div className="mt-auto mb-[0.6em] text-center text-[0.7em] text-white/60">{p.demoCall}</div>
        <button
          type="button"
          onClick={() => setCalling(false)}
          aria-label={p.end}
          className="mb-[2em] flex h-[3.6em] w-[3.6em] items-center justify-center rounded-full bg-[#FF3B30] active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="1.8em" height="1.8em" fill="#fff">
            <path d="M12 8.8c3.4 0 6.6 1.1 8.6 3 .4.4.5 1 .2 1.5l-1.2 1.8c-.3.5-.9.6-1.4.4l-2.6-1.1c-.4-.2-.7-.6-.7-1.1v-1.6a11 11 0 0 0-5.8 0v1.6c0 .5-.3.9-.7 1.1l-2.6 1.1c-.5.2-1.1 0-1.4-.4L3.2 13.3c-.3-.5-.2-1.1.2-1.5 2-1.9 5.2-3 8.6-3z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
      <AppBar title={p.title} />
      <div className="flex h-[3.4em] shrink-0 flex-col items-center justify-center px-[0.8em]">
        <div className="max-w-full truncate text-[1.7em] font-light tracking-wide">{num || " "}</div>
        {name && <div className={`text-[0.8em] ${t.sub}`}>{name}</div>}
      </div>
      <div className="grid flex-1 grid-cols-3 content-center gap-[0.35em] px-[1.2em]">
        {PAD.map(([d, l]) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className={`flex h-[2.9em] flex-col items-center justify-center rounded-full ${t.dark ? "bg-white/10 active:bg-white/25" : "bg-black/[0.06] active:bg-black/15"}`}
          >
            <span className="text-[1.3em] leading-none">{d}</span>
            <span className={`text-[0.5em] font-semibold tracking-widest ${t.sub}`}>{l || " "}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-[1.4em] py-[0.8em]">
        <span className="w-[2.4em]" />
        <button
          type="button"
          onClick={call}
          aria-label={p.call}
          className="flex h-[3.2em] w-[3.2em] items-center justify-center rounded-full bg-[#34C759] active:scale-95 disabled:opacity-40"
          disabled={!num}
        >
          <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" fill="#fff">
            <path d="M6.6 3.5c.5 0 .9.3 1.1.7l1.3 3c.2.5.1 1-.3 1.3L7.2 9.7a11 11 0 0 0 5.1 5.1l1.2-1.5c.3-.4.9-.5 1.3-.3l3 1.3c.5.2.8.7.7 1.2l-.3 2.6c-.1.6-.6 1-1.2 1C9.7 19 3.9 13.3 3.8 5.9c0-.6.4-1.1 1-1.2z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={() => setNum((n) => n.slice(0, -1))}
          className={`flex h-[2.4em] w-[2.4em] items-center justify-center rounded-full ${num ? "" : "invisible"} ${t.hover}`}
        >
          <svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 5h11v14H9l-6-7z" />
            <path d="M12.5 9.5l5 5m0-5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
