"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTenantMutation } from "@/lib/tenants/queries";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only."),
});

type Values = z.infer<typeof schema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateTenantDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateTenantMutation();
  const { switchTo } = useTenantSwitch();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", slug: "" } });

  const nameField = register("name", {
    // Suggest a slug until the user edits it themselves.
    onChange: (e) => {
      if (!dirtyFields.slug) setValue("slug", slugify(e.target.value), { shouldValidate: true });
    },
  });

  async function onSubmit(values: Values) {
    try {
      const tenant = await createMutation.mutateAsync(values);
      toast.success(`Created ${tenant.name}.`);
      onOpenChange(false);
      reset();
      await switchTo(tenant.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the organization.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            A separate workspace with its own alerts, incidents and team. You&rsquo;ll be
            switched into it once it&rsquo;s created.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-name">Name</Label>
            <Input id="tenant-name" aria-invalid={!!errors.name} {...nameField} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-slug">Slug</Label>
            <Input id="tenant-slug" aria-invalid={!!errors.slug} {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
