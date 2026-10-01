export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

// A donut that never leans on colour alone: every segment is also named,
// counted and listed in the legend beside it.
export function Donut({
  segments,
  size = 132,
  centerLabel,
  ariaLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  centerLabel: string;
  ariaLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const len = (s.value / total) * c;
              const el = (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
              offset += len;
              return el;
            })}
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
          {total}
        </text>
        <text x="50%" y="64%" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          {centerLabel}
        </text>
      </svg>
      <ul className="flex min-w-32 flex-1 flex-col gap-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
            <span className="flex-1 text-muted-foreground">{s.label}</span>
            <span className="font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
