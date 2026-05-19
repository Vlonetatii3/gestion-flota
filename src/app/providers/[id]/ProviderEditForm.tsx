"use client";

import { useActionState } from "react";
import { updateProvider } from "@/actions/provider-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm text-destructive mt-1">{errors[0]}</p>;
}

type Provider = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  services: string | null;
};

export default function ProviderEditForm({ provider }: { provider: Provider }) {
  const updateWithId = updateProvider.bind(null, provider.id);
  const [state, action, isPending] = useActionState(updateWithId, null);

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar proveedor</h1>
        <p className="text-sm text-muted-foreground mt-1">{provider.name}</p>
      </div>

      <div className="app-section space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <Input name="name" defaultValue={provider.name} className="mt-1" />
            <FieldError errors={state?.fieldErrors?.name} />
          </div>
          <div>
            <label className="text-sm font-medium">Contacto</label>
            <Input
              name="contactName"
              defaultValue={provider.contactName || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              defaultValue={provider.email || ""}
              className="mt-1"
            />
            <FieldError errors={state?.fieldErrors?.email} />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              name="phone"
              defaultValue={provider.phone || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Servicios</label>
            <Input
              name="services"
              defaultValue={provider.services || ""}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </main>
  );
}