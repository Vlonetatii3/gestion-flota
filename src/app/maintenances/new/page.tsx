export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { createMaintenance } from "@/actions/maintenance-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NewMaintenancePage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { code: "asc" },
  });

  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuevo mantenimiento</h1>

      <form action={createMaintenance} className="space-y-4">
        <select name="vehicleId" className="app-input" required>
          <option value="">Seleccionar vehículo</option>

          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.code}
              {v.plate && v.plate !== v.code ? ` — ${v.plate}` : ""}
            </option>
          ))}
        </select>

        <select name="providerId" className="app-input">
          <option value="">Sin proveedor</option>

          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <Input name="title" placeholder="Cambio de aceite" required />

        <Input name="performedAt" type="date" required />

        <Input name="nextDueDate" type="date" />

        <Input name="cost" type="number" placeholder="Costo" min="0" />

        <Button type="submit" className="w-full">
          Guardar mantenimiento
        </Button>
      </form>
    </main>
  );
}