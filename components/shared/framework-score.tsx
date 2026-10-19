// A score ring with passed/failed counts per compliance framework (guide
// A8/P7). The score is computed server-side and only formatted here.
export function FrameworkScore({
  name,
  version,
  score,
  passed,
  failed,
  notApplicable,
  asOf,
}: {
  name: string;
  version?: string;
  score: number;
  passed: number;
  failed: number;
  notApplicable?: number;
  asOf?: string;
}) {
  const size = 96, stroke = 10, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--amber)" : "var(--red)";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${name} score: ${pct} percent`} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-lg font-bold tabular-nums">
          {pct}%
        </text>
      </svg>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate font-heading font-bold">{name}</p>
        {version && <p className="text-xs text-muted-foreground">v{version}{asOf ? ` · as of ${asOf}` : ""}</p>}
        <div className="mt-1 flex items-center gap-3 text-xs">
          <span className="text-tone-green-fg">{passed} passed</span>
          <span className="text-tone-red-fg">{failed} failed</span>
          {notApplicable !== undefined && <span className="text-muted-foreground">{notApplicable} n/a</span>}
        </div>
      </div>
    </div>
  );
}
