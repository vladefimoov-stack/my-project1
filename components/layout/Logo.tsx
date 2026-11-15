/** Temporary text-based brand identity: a 3×3 "keypad" mark + wordmark. */
export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  const c = inverted ? "#fff" : "#111";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Keyline">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        {[0, 1, 2].flatMap((r) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${r}${col}`}
              x={col * 6.5}
              y={r * 6.5}
              width="5"
              height="5"
              rx="1.4"
              fill={c}
              opacity={r === 0 && col === 1 ? 1 : r === 0 ? 0.55 : 0.85}
            />
          ))
        )}
      </svg>
      <span className="text-[19px] font-semibold tracking-[-0.04em]" style={{ color: c }}>
        keyline
      </span>
    </span>
  );
}
