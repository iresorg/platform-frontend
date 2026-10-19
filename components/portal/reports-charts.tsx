"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OutcomeSlice, ResolutionPoint, VolumePoint } from "@/lib/portal/reports";

const OUTCOME_COLOR: Record<OutcomeSlice["tone"], string> = {
  blue: "#3b82f6",
  amber: "#f59e0b",
  emerald: "#10b981",
};

const AXIS_STYLE = {
  fontSize: 12,
  fill: "var(--muted-foreground)",
};

function ChartCard({
  title,
  description,
  insight,
  legend,
  children,
}: {
  title: string;
  description: string;
  insight: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-heading font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 h-56 w-full">{children}</div>
      {legend}
      <p className="mt-3 border-t border-border pt-3 text-sm">{insight}</p>
    </div>
  );
}

export function VolumeOverTimeChart({
  data,
  insight,
}: {
  data: VolumePoint[];
  insight: string;
}) {
  return (
    <ChartCard
      title="Volume over time"
      description="Security events recorded per day"
      insight={insight}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Events"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--brand)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function OutcomeBreakdownChart({
  data,
  insight,
}: {
  data: OutcomeSlice[];
  insight: string;
}) {
  return (
    <ChartCard
      title="Outcome breakdown"
      description="Where your incidents stand right now"
      insight={insight}
      legend={
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {data.map((slice) => (
            <span key={slice.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: OUTCOME_COLOR[slice.tone] }}
                aria-hidden="true"
              />
              {slice.label} ({slice.count})
            </span>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((slice) => (
              <Cell key={slice.label} fill={OUTCOME_COLOR[slice.tone]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ResolutionTimeTrendChart({
  data,
  insight,
}: {
  data: ResolutionPoint[];
  insight: string;
}) {
  return (
    <ChartCard
      title="Resolution-time trend"
      description="Average hours from open to resolved"
      insight={insight}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="avgHours"
            name="Avg. hours"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--brand)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
