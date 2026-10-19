"use client";

import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerQuery } from "@/lib/customers/queries";
import type { Contact } from "@/lib/customers/types";

function ContactRow({ label, contact }: { label: string; contact: Contact | null }) {
  if (!contact) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-medium">{contact.name}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">{contact.phone} <CopyButton text={contact.phone} label="phone number" /></span>
        <span className="inline-flex items-center gap-1">{contact.email} <CopyButton text={contact.email} label="email address" /></span>
      </div>
    </div>
  );
}

// Loaded once per case — analysts need these when they escalate.
export function ClientContacts({ customerId }: { customerId: string | undefined }) {
  const { data, isLoading } = useCustomerQuery(customerId);

  if (!customerId) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Client contacts</h3>
      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : !data || (!data.technical_contact && !data.escalation_contact) ? (
        <p className="text-sm text-muted-foreground">No contacts on file.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <ContactRow label="Technical contact" contact={data.technical_contact} />
          <ContactRow label="Escalation contact" contact={data.escalation_contact} />
        </div>
      )}
    </div>
  );
}
