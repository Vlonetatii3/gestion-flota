export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteVehicleDialog } from "@/components/ui/delete-vehicle-dialog";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Vehículos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vehicles.length} equipos registrados
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">+ Nuevo vehículo</Link>
        </Button>
      </div>

      <div className="app-table">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-4 text-left font-medium text-muted-foreground">Código</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Marca / Modelo</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Patente</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Horas motor</th>
              <th className="p-4 text-left font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t hover:bg-muted/20 transition-colors">
                <td className="p-4 font-medium">{vehicle.code}</td>
                <td className="p-4 text-muted-foreground">{vehicle.type}</td>
                <td className="p-4">
                  {vehicle.brand || vehicle.model
                    ? [vehicle.brand, vehicle.model].filter(Boolean).join(" ")
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="p-4">
                  {vehicle.plate || <span className="text-muted-foreground">—</span>}
                </td>
                <td className="p-4">
                  <span className="font-mono">
                    {vehicle.engineHours.toLocaleString("es-AR")} h
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/vehicles/${vehicle.id}`}>Editar</Link>
                    </Button>
                    <DeleteVehicleDialog vehicleId={vehicle.id} />
                  </div>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}