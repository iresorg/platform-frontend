import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cases used to live under other names; keep old bookmarks working.
  async redirects() {
    return [
      { source: "/portal/history", destination: "/portal/incidents", permanent: false },
      { source: "/portal/cases/:id", destination: "/portal/incidents/:id", permanent: false },
      { source: "/cases/incidents", destination: "/cases", permanent: false },
      { source: "/cases/incidents/:id", destination: "/cases/:id", permanent: false },
      { source: "/cases/overview", destination: "/cases/live-overview", permanent: false },
      { source: "/cases/incident-command", destination: "/cases", permanent: false },
    ];
  },
};

export default nextConfig;
