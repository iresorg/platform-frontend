import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { href: "#how-it-works", label: "How it works" },
      { href: "#platform", label: "The iRES advantage" },
      { href: "#solutions", label: "Solutions" },
    ],
  },
  {
    heading: "Access",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Register your organization" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Wordmark inverted className="h-8 w-auto self-start" />
            <p className="max-w-xs text-sm text-white/60">
              One case pipeline connecting live security detections and
              OpenCTI intelligence — full context for analysts, plain
              language for clients.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-wide text-white/50 uppercase">
                {column.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iRES — Incident Response &amp; Emergency Service</p>
          <p>24/7 Cyber Emergency Response</p>
        </div>
      </div>
    </footer>
  );
}
