import { Chips } from "@/components/alerts/chips";
import { humanizeKey } from "@/lib/alerts/raw-payload";
import type { JsonObject } from "@/lib/alerts/types";

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeCode(value: string): boolean {
  return /[\\/]/.test(value) || (!/\s/.test(value) && value.length > 24);
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === "string" || typeof v === "number") ? (
      <Chips items={value.map(String)} />
    ) : (
      <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  if (typeof value === "string") {
    return looksLikeCode(value) ? (
      <span className="font-mono text-xs break-all">{value}</span>
    ) : (
      <span className="break-words">{value}</span>
    );
  }
  return <span>{String(value)}</span>;
}

// Renders any JSON object as labeled rows, recursing into nested objects.
// Used for threat_context, whose keys differ by rule, so nothing here can
// assume a fixed shape.
export function KeyValueTree({ data }: { data: JsonObject }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No details.</p>;

  return (
    <dl className="flex flex-col gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {humanizeKey(key)}
          </dt>
          <dd className="text-sm">
            {isObject(value) ? (
              <div className="border-l-2 border-border pl-3">
                <KeyValueTree data={value} />
              </div>
            ) : (
              <Value value={value} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
