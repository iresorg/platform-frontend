import { Clock, Mail, Phone } from "lucide-react";
import { PortalSubnav } from "@/components/portal/portal-subnav";

export default function PortalSupportPage() {
  return (
    <div className="flex flex-col gap-4">
      <PortalSubnav />

      <div>
        <h1 className="text-xl">Support</h1>
        <p className="text-sm text-muted-foreground">
          Your SOC team is monitoring around the clock. Reach out any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="mailto:soc@iresorg.com"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
            <Mail className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">Email</p>
            <p className="text-sm text-muted-foreground">soc@iresorg.com</p>
          </div>
        </a>

        <a
          href="tel:+18005550199"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
            <Phone className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-sm text-muted-foreground">+1 (800) 555-0199</p>
          </div>
        </a>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
          <Clock className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium">Coverage</p>
          <p className="text-sm text-muted-foreground">
            Analysts are monitoring your account 24 hours a day, every day of
            the week. Urgent incidents are picked up immediately — there&apos;s no
            need to call ahead for those.
          </p>
        </div>
      </div>
    </div>
  );
}
