"use client";

import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerQuery } from "@/lib/customers/queries";

interface Contact {
  name?: string;
  phone?: string;
  email?: string;
}

// The backend doesn't declare a shape for `contacts` at all (no type in
// the schema) — read defensively rather than assume the addendum's
// {technical_contact, escalation_contact} guess is exactly right.
function readContact(contacts: unknown, key: string): Contact | null {
  if (!contacts || typeof contacts !== "object") return null;
  const value = (contacts as Record<string, unknown>)[key];
  if (!value || typeof value !== "object") return null;
  return value as Contact;
}

function ContactRow({ label, contact }: { label: string; contact: Contact | null }) {
  if (!contact) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      {contact.name && <p className="text-sm font-medium">{contact.name}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {contact.phone && <span className="inline-flex items-center gap-1">{contact.phone} <CopyButton text={contact.phone} label="phone number" /></span>}
        {contact.email && <span className="inline-flex items-center gap-1">{contact.email} <CopyButton text={contact.email} label="email address" /></span>}
      </div>
    </div>
  );
}

// Loaded once per case — analysts need these when they escalate. `bare`
// drops the heading/divider for callers that already provide their own
// card chrome (the Customers screen's own Contacts card).
export function ClientContacts({ customerId, bare = false }: { customerId: string | undefined; bare?: boolean }) {
  const { data, isLoading } = useCustomerQuery(customerId);
  const technical = data ? readContact(data.contacts, "technical_contact") : null;
  const escalation = data ? readContact(data.contacts, "escalation_contact") : null;

  if (!customerId) return null;

  return (
    <div className={bare ? "flex flex-col gap-3" : "mt-4 flex flex-col gap-3 border-t border-border pt-4"}>
      {!bare && <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Client contacts</h3>}
      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : !technical && !escalation ? (
        <p className="text-sm text-muted-foreground">No contacts on file.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <ContactRow label="Technical contact" contact={technical} />
          <ContactRow label="Escalation contact" contact={escalation} />
        </div>
      )}
    </div>
  );
}
