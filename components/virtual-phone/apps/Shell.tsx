"use client";

import { usePhone } from "../context";

export function useTheme() {
  const { settings } = usePhone();
  const d = settings.dark;
  return {
    dark: d,
    bg: d ? "bg-[#0F1013]" : "bg-[#F4F5F7]",
    card: d ? "bg-[#1B1C20]" : "bg-white",
    text: d ? "text-white" : "text-[#111]",
    sub: d ? "text-white/55" : "text-black/50",
    line: d ? "border-white/10" : "border-black/[0.07]",
    hover: d ? "active:bg-white/10" : "active:bg-black/5",
  };
}

export function BackButton({ color = "currentColor" }: { color?: string }) {
  const { press } = usePhone();
  return (
    <button
      type="button"
      onClick={() => press("softR")}
      aria-label="Back"
      className="-ml-[0.4em] flex h-[2.4em] w-[2.4em] shrink-0 items-center justify-center rounded-full active:bg-black/10"
    >
      <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

export function AppBar({
  title,
  className = "",
  sub,
  right,
  left,
}: {
  title: React.ReactNode;
  className?: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  left?: React.ReactNode;
}) {
  return (
    <div className={`flex h-[3.4em] shrink-0 items-center gap-[0.4em] px-[0.8em] ${className}`}>
      <BackButton />
      {left}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[1.2em] font-semibold leading-tight">{title}</div>
        {sub && <div className="truncate text-[0.8em] opacity-70">{sub}</div>}
      </div>
      {right}
    </div>
  );
}
