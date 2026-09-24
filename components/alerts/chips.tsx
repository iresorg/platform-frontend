export function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
