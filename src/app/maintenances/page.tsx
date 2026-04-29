export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMaintenanceStatus } from "@/lib/maintenance";

type Props = {
  searchParams: Promise<{
    vehicle?: string;
    provider?: string;
    order?: string;
    status?: string;
  }>;
};

export default async function MaintenancesPage({ searchParams }: Props) {
  const { vehicle, provider, order, status } = await searchParams;

  const items = await prisma.maintenance.findMany({
    where: {
      vehicle: vehicle
        ? {
            OR: [
              { plate: { contains: vehicle, mode: "insensitive" } },
              { code: { contains: vehicle, mode: "insensitive" } },
            ],
          }
        : undefined,

      provider: provider
        ? {
            name: {
              contains: provider,
              mode: "insensitive",
            },
          }
        : undefined,
    },
    include: {
      vehicle: true,
      provider: true,
    },
    orderBy: {
      performedAt: order === "asc" ? "asc" : "desc",
    },
  });

  const filteredItems = items.filter((item) => {
    if (!status) return true;
    if (!item.nextDueDate) return false;

    const diffDays = Math.ceil(
      (item.nextDueDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (status === "overdue") return diffDays < 0;
    if (status === "upcoming") return diffDays >= 0 && diffDays <= 30;
    if (status === "valid") return diffDays > 30;

    return true;
  });

  const totalCost = filteredItems.reduce((acc, item) => {
    return acc + Number(item.cost || 0);
  }, 0);

  const averageCost =
    filteredItems.length > 0 ? totalCost / filteredItems.length : 0;

  return (
    <main className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Mantenimientos</h1>

        <Button asChild>
          <Link href="/maintenances/new">Nuevo</Link>
        </Button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          name="vehicle"
          defaultValue={vehicle || ""}
          placeholder="Buscar por matrícula o código"
          className="border p-2 rounded"
        />

        <input
          name="provider"
          defaultValue={provider || ""}
          placeholder="Buscar por proveedor"
          className="border p-2 rounded"
        />

        <select
          name="order"
          defaultValue={order || "desc"}
          className="border p-2 rounded"
        >
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>

        <select
          name="status"
          defaultValue={status || ""}
          className="border p-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="valid">Vigentes</option>
          <option value="upcoming">Próximos a vencer</option>
          <option value="overdue">Vencidos</option>
        </select>

        <Button type="submit">Buscar</Button>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Registros</p>
          <p className="text-2xl font-bold">{filteredItems.length}</p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Costo acumulado</p>
          <p className="text-2xl font-bold">
            ${totalCost.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Costo promedio</p>
          <p className="text-2xl font-bold">
            ${averageCost.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => {
          const maintenanceStatus = getMaintenanceStatus(item.nextDueDate);

          return (
            <div key={item.id} className="border p-4 rounded-xl space-y-2">
              <h3 className="font-semibold text-lg">{item.title}</h3>

              <span
                className={`
                  inline-flex rounded-full border px-3 py-1 text-xs font-medium
                  ${maintenanceStatus.className}
                `}
              >
                {maintenanceStatus.label}
              </span>

              <p>
                Vehículo: {item.vehicle.code}
                {item.vehicle.plate && item.vehicle.plate !== item.vehicle.code
                  ? ` — ${item.vehicle.plate}`
                  : ""}
              </p>

              <p>Proveedor: {item.provider?.name || "Sin proveedor"}</p>

              <p>
                Costo: $
                {item.cost ? Number(item.cost).toLocaleString("es-AR") : "-"}
              </p>

              <p>
                Fecha realizada:{" "}
                {item.performedAt.toLocaleDateString("es-AR")}
              </p>

              <p>
                Próximo:{" "}
                {item.nextDueDate?.toLocaleDateString("es-AR") || "-"}
              </p>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="border rounded-xl p-6 text-center text-muted-foreground">
            No se encontraron mantenimientos.
          </div>
        )}
      </div>
    </main>
  );
}