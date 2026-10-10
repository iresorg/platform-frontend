import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cases used to live under other names; keep old bookmarks working.
  async redirects() {
    return [
      { source: "/portal/history", destination: "/portal/incidents", permanent: false },
      { source: "/portal/cases/:id", destination: "/portal/incidents/:id", permanent: false },
      { source: "/cases/incidents", destination: "/cases", permanent: false },
      { source: "/cases/incidents/:id", destination: "/cases/:id", permanent: false },
      { source: "/cases/incident-command", destination: "/cases", permanent: false },
      // Target build: the SOC overview and alerts explorer moved out from
      // under /cases to their own top-level routes (guide A1, A2).
      { source: "/cases/overview", destination: "/overview", permanent: false },
      { source: "/cases/live-overview", destination: "/overview", permanent: false },
      { source: "/cases/live-alerts", destination: "/alerts", permanent: false },
      { source: "/cases/live-alerts/:id", destination: "/alerts/:id", permanent: false },
    ];
  },
};

export default nextConfig;
