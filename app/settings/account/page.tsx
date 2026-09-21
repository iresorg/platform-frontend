"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SessionsCard } from "@/components/settings/sessions-card";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold">{title}</h2>
      {description && <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Account</h1>
        <p className="text-sm text-muted-foreground">
          Your profile, password and signed-in devices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Profile">
          <div className="divide-y divide-border">
            <Field label="Name" value={user?.name} />
            <Field label="Email" value={user?.email} />
            <Field label="Active organization" value={user?.tenant_name ?? "—"} />
            <Field
              label="Workspace"
              value={user?.role === "customer" ? "Customer portal" : "SOC workspace"}
            />
          </div>
        </Card>

        <Card title="Change password" description="You'll stay signed in on this device.">
          <ChangePasswordForm />
        </Card>
      </div>

      <Card
        title="Signed-in devices"
        description="Sessions that can currently access your account. Revoke any you don't recognize."
      >
        <SessionsCard />
      </Card>
    </div>
  );
}
