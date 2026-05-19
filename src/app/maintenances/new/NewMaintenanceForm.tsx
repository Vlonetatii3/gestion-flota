"use client";

import { useActionState } from "react";
import { createMaintenance } from "@/actions/maintenance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm text-destructive mt-1">{errors[0]}</p>;
}

type Vehicle = { id: string; code: string; plate: string | null };
type Provider = { id: string; name: string };

export default function NewMaintenanceForm({
  vehicles,
  providers,
}: {
  vehicles: Vehicle[];
  providers: Provider[];
}) {
  const [state, action, isPending] = useActionState(createMaintenance, null);

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo mantenimiento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registrá un servicio realizado o programado.
        </p>
      </div>

      <div className="app-section space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Vehículo *</label>
              <select name="vehicleId" className="app-input mt-1" required>
                <option value="">Seleccionar vehículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code}
                    {v.plate && v.plate !== v.code ? ` — ${v.plate}` : ""}
                  </option>
                ))}
              </select>
              <FieldError errors={state?.fieldErrors?.vehicleId} />
            </div>

            <div>
              <label className="text-sm font-medium">Categoría *</label>
              <select name="category" className="app-input mt-1">
                <option value="PREVENTIVE">Preventivo</option>
                <option value="CORRECTIVE">Correctivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Título del servicio *</label>
            <Input
              name="title"
              placeholder="Cambio de aceite, revisión de frenos..."
              className="mt-1"
            />
            <FieldError errors={state?.fieldErrors?.title} />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              placeholder="Detalles adicionales del servicio..."
              className="app-input mt-1 h-20 py-2 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha realizada *</label>
              <Input name="performedAt" type="date" className="mt-1" />
              <FieldError errors={state?.fieldErrors?.performedAt} />
            </div>
            <div>
              <label className="text-sm font-medium">Próximo vencimiento</label>
              <Input name="nextDueDate" type="date" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Horas motor actuales</label>
              <Input
                name="currentEngineHours"
                type="number"
                min="0"
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Próximo venc. (horas)</label>
              <Input
                name="nextDueEngineHours"
                type="number"
                min="0"
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Proveedor</label>
              <select name="providerId" className="app-input mt-1">
                <option value="">Sin proveedor</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Costo</label>
              <Input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar mantenimiento"}
          </Button>
        </form>
      </div>
    </main>
  );
}