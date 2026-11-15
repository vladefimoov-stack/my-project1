"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { usePhone, useKeys } from "../context";
import { AppBar, useTheme } from "./Shell";

type Msg = { dir: "in" | "out"; text: string };

const HUES = [200, 30, 280, 140];

/** classic multi-tap text entry from the physical keypad */
const T9: Record<string, string> = {
  "1": ".,!?1", "2": "abc2", "3": "def3", "4": "ghi4", "5": "jkl5",
  "6": "mno6", "7": "pqrs7", "8": "tuv8", "9": "wxyz9", "0": " 0",
};

export function Messaging({ variant }: { variant: "telegram" | "whatsapp" }) {
  const { dict } = useI18n();
  const m = dict.demo.messaging;
  const t = useTheme();
  const { beep } = usePhone();
  const [chat, setChat] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [threads, setThreads] = useState<Msg[][]>(() =>
    m.chats.map((c) => c.messages.map(([dir, text]) => ({ dir: dir as "in" | "out", text })))
  );
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const accent = variant === "telegram" ? "#2AA3E8" : "#1FAF54";
  const headerCls = variant === "telegram" ? "bg-[#2AA3E8] text-white" : "bg-[#1C8D4A] text-white";

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [threads, chat, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text || chat === null) return;
    const c = chat;
    setThreads((th) => th.map((msgs, i) => (i === c ? [...msgs, { dir: "out", text }] : msgs)));
    setDraft("");
    beep(880);
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setThreads((th) => th.map((msgs, i) => (i === c ? [...msgs, { dir: "in", text: m.autoReply }] : msgs)));
    }, 1400);
  };

  const tap = useRef<{ key: string; i: number; at: number } | null>(null);
  const typeT9 = (k: string) => {
    const letters = T9[k];
    if (!letters) return false;
    const now = Date.now();
    const prev = tap.current;
    if (prev && prev.key === k && now - prev.at < 900) {
      const i = (prev.i + 1) % letters.length;
      tap.current = { key: k, i, at: now };
      setDraft((d) => d.slice(0, -1) + letters[i]);
    } else {
      tap.current = { key: k, i: 0, at: now };
      setDraft((d) => (d + letters[0]).slice(0, 200));
    }
    return true;
  };

  useKeys((k) => {
    if (chat === null) {
      if (k === "up") return setFocus((f) => Math.max(0, f - 1)), true;
      if (k === "down") return setFocus((f) => Math.min(m.chats.length - 1, f + 1)), true;
      if (k === "ok") return setChat(focus), true;
      return false;
    }
    if (k === "softR") return setChat(null), setTyping(false), true;
    if (k === "ok") return send(), true;
    if (k === "*") return setDraft((d) => d.slice(0, -1)), (tap.current = null), true;
    return typeT9(k);
  });

  if (chat === null) {
    return (
      <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
        <AppBar title={dict.demo.apps[variant]} className={headerCls} />
        <div className={`mx-[0.8em] my-[0.6em] flex h-[2.2em] items-center rounded-full px-[0.9em] text-[0.85em] ${t.card} ${t.sub}`}>
          {m.search}
        </div>
        <ul className="no-scrollbar flex-1 overflow-y-auto">
          {m.chats.map((c, i) => (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => setChat(i)}
                className={`flex w-full items-center gap-[0.7em] px-[0.8em] py-[0.55em] text-left ${t.hover} ${focus === i ? (t.dark ? "bg-white/5" : "bg-black/[0.04]") : ""}`}
              >
                <span
                  className="flex h-[2.6em] w-[2.6em] shrink-0 items-center justify-center rounded-full text-[1em] font-semibold text-white"
                  style={{ background: `linear-gradient(160deg,hsl(${HUES[i % 4]} 70% 62%),hsl(${HUES[i % 4]} 65% 48%))` }}
                >
                  {c.name[0]}
                </span>
                <span className={`min-w-0 flex-1 border-b pb-[0.55em] ${t.line}`}>
                  <span className="flex justify-between gap-2">
                    <span className="truncate text-[1em] font-semibold">{c.name}</span>
                    <span className={`shrink-0 text-[0.75em] ${t.sub}`}>{c.time}</span>
                  </span>
                  <span className={`block truncate text-[0.85em] ${t.sub}`}>{c.preview}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const c = m.chats[chat];
  const chatBg =
    variant === "telegram"
      ? t.dark ? "bg-[#0E1621]" : "bg-[#CFE3EE]"
      : t.dark ? "bg-[#0B141A]" : "bg-[#ECE5DD]";
  return (
    <div className={`flex h-full flex-col ${chatBg}`}>
      <AppBar title={c.name} sub={typing ? "…" : chat === 0 ? m.online : m.lastSeen} className={headerCls} />
      <div ref={listRef} className="no-scrollbar flex flex-1 flex-col gap-[0.4em] overflow-y-auto px-[0.7em] py-[0.7em]">
        {threads[chat].map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-[1em] px-[0.8em] py-[0.45em] text-[0.92em] leading-snug shadow-sm ${
              msg.dir === "out"
                ? `self-end rounded-br-[0.3em] ${variant === "telegram" ? (t.dark ? "bg-[#2B5278] text-white" : "bg-[#E1FFC7] text-black") : t.dark ? "bg-[#005C4B] text-white" : "bg-[#D9FDD3] text-black"}`
                : `self-start rounded-bl-[0.3em] ${t.dark ? "bg-[#1F2C34] text-white" : "bg-white text-black"}`
            }`}
          >
            {msg.text}
          </div>
        ))}
        {typing && (
          <div className={`self-start rounded-[1em] px-[0.8em] py-[0.45em] ${t.dark ? "bg-[#1F2C34]" : "bg-white"}`}>
            <span className="inline-flex gap-[0.2em]">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-[0.4em] w-[0.4em] animate-bounce rounded-full bg-current opacity-50" style={{ animationDelay: `${d * 120}ms`, color: accent }} />
              ))}
            </span>
          </div>
        )}
      </div>
      <form
        className={`flex items-center gap-[0.4em] px-[0.5em] py-[0.5em] ${t.dark ? "bg-[#17212B]" : "bg-white/90"}`}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={m.typeMessage}
          aria-label={m.typeMessage}
          maxLength={200}
          className={`h-[2.4em] min-w-0 flex-1 rounded-full px-[0.9em] text-[16px] outline-none ${
            t.dark ? "bg-white/10 text-white placeholder:text-white/40" : "bg-black/5 text-black placeholder:text-black/40"
          }`}
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex h-[2.4em] w-[2.4em] shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-90"
          style={{ background: accent }}
        >
          <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="currentColor">
            <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
