"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { usePhone, useKeys } from "../context";
import { CONTACTS } from "../data";
import { AppBar, useTheme } from "./Shell";

export function Contacts() {
  const { dict } = useI18n();
  const c = dict.demo.contacts;
  const t = useTheme();
  const { open } = usePhone();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const list = useMemo(() => CONTACTS.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())), [q]);

  useKeys((k) => {
    if (sel) {
      if (k === "softR") return setSel(null), true;
      if (k === "call" || k === "ok") return open("phone", sel), true;
      return false;
    }
    if (k === "up") return setFocus((f) => Math.max(0, f - 1)), true;
    if (k === "down") return setFocus((f) => Math.min(list.length - 1, f + 1)), true;
    if (k === "ok" && list[focus]) return setSel(list[focus].id), true;
    if (k === "call" && list[focus]) return open("phone", list[focus].id), true;
    return false;
  });

  const person = CONTACTS.find((x) => x.id === sel);
  if (person) {
    return (
      <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
        <AppBar title={c.title} />
        <div className="flex flex-col items-center px-[1em] pt-[1em]">
          <div
            className="flex h-[5em] w-[5em] items-center justify-center rounded-full text-[1.6em] font-semibold text-white"
            style={{ background: `linear-gradient(160deg,hsl(${person.hue} 70% 62%),hsl(${person.hue} 65% 46%))` }}
          >
            {person.name[0]}
          </div>
          <div className="mt-[0.6em] text-[1.4em] font-semibold">{person.name}</div>
        </div>
        <div className={`mx-[0.8em] mt-[1.2em] flex items-center justify-between rounded-[1em] px-[0.9em] py-[0.7em] ${t.card}`}>
          <div>
            <div className={`text-[0.75em] ${t.sub}`}>{c.mobile}</div>
            <div className="text-[1em]">{person.phone}</div>
          </div>
          <button
            type="button"
            onClick={() => open("phone", person.id)}
            aria-label={dict.demo.phone.call}
            className="flex h-[2.6em] w-[2.6em] items-center justify-center rounded-full bg-[#34C759] active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="#fff">
              <path d="M6.6 3.5c.5 0 .9.3 1.1.7l1.3 3c.2.5.1 1-.3 1.3L7.2 9.7a11 11 0 0 0 5.1 5.1l1.2-1.5c.3-.4.9-.5 1.3-.3l3 1.3c.5.2.8.7.7 1.2l-.3 2.6c-.1.6-.6 1-1.2 1C9.7 19 3.9 13.3 3.8 5.9c0-.6.4-1.1 1-1.2z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${t.bg} ${t.text}`}>
      <AppBar title={c.title} />
      <div className="px-[0.8em] pb-[0.5em]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={c.search}
          aria-label={c.search}
          className={`h-[2.3em] w-full rounded-full px-[0.9em] text-[16px] outline-none ${t.card} ${t.dark ? "placeholder:text-white/40" : "placeholder:text-black/40"}`}
        />
      </div>
      <ul className="no-scrollbar flex-1 overflow-y-auto">
        {list.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setSel(p.id)}
              className={`flex w-full items-center gap-[0.7em] px-[0.9em] py-[0.45em] text-left ${t.hover} ${focus === i ? (t.dark ? "bg-white/5" : "bg-black/[0.04]") : ""}`}
            >
              <span
                className="flex h-[2.3em] w-[2.3em] shrink-0 items-center justify-center rounded-full text-[0.95em] font-semibold text-white"
                style={{ background: `hsl(${p.hue} 60% 55%)` }}
              >
                {p.name[0]}
              </span>
              <span className="text-[1em]">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
