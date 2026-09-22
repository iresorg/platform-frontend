import { AdvantageGrid } from "@/components/landing/advantage-grid";
import { CoverageGrid } from "@/components/landing/coverage-grid";
import { CtaBand } from "@/components/landing/cta-band";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { IntegrationsStrip } from "@/components/landing/integrations-strip";
import { PersonaQuotes } from "@/components/landing/persona-quotes";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { SolutionsGrid } from "@/components/landing/solutions-grid";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <IntegrationsStrip />
        <HowItWorks />
        <AdvantageGrid />
        <CoverageGrid />
        <SolutionsGrid />
        <PersonaQuotes />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
