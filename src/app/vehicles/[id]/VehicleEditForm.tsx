"use client";

import { useActionState } from "react";
import { updateVehicle } from "@/actions/vehicle-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm text-destructive mt-1">{errors[0]}</p>;
}

type Vehicle = {
  id: string;
  code: string;
  type: string;
  brand: string | null;
  model: string | null;
  plate: string | null;
  engineHours: number;
};

export default function VehicleEditForm({ vehicle }: { vehicle: Vehicle }) {
  const updateWithId = updateVehicle.bind(null, vehicle.id);
  const [state, action, isPending] = useActionState(updateWithId, null);

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar vehículo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vehicle.code} — {vehicle.type}
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
              <label className="text-sm font-medium">Código interno *</label>
              <Input name="code" defaultValue={vehicle.code} className="mt-1" />
              <FieldError errors={state?.fieldErrors?.code} />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <Input name="type" defaultValue={vehicle.type} className="mt-1" />
              <FieldError errors={state?.fieldErrors?.type} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Marca</label>
              <Input name="brand" defaultValue={vehicle.brand || ""} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Modelo</label>
              <Input name="model" defaultValue={vehicle.model || ""} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Patente</label>
              <Input name="plate" defaultValue={vehicle.plate || ""} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Horas de motor</label>
              <Input
                name="engineHours"
                type="number"
                min="0"
                defaultValue={vehicle.engineHours}
                className="mt-1"
              />
              <FieldError errors={state?.fieldErrors?.engineHours} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </main>
  );
}