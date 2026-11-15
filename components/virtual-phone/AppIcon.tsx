import { APPS, type AppId } from "@/lib/apps";

export function AppIcon({ id, className = "" }: { id: AppId; className?: string }) {
  const app = APPS.find((a) => a.id === id)!;
  const gid = `g-${id}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={app.bg[0]} />
          <stop offset="1" stopColor={app.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.6" fill={`url(#${gid})`} />
      <g transform="translate(2.4 2.4) scale(0.8)">
        {app.paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} fillRule={p.evenOdd ? "evenodd" : "nonzero"} />
        ))}
      </g>
    </svg>
  );
}
