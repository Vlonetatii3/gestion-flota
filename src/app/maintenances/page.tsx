export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaintenanceCard } from "@/components/ui/maintenance-card";

type Props = {
  searchParams: Promise<{
    vehicle?: string;
    provider?: string;
    order?: string;
    status?: string;
    category?: string;
  }>;
};

export default async function MaintenancesPage({ searchParams }: Props) {
  const { vehicle, provider, order, status, category } = await searchParams;

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
        ? { name: { contains: provider, mode: "insensitive" } }
        : undefined,
      category:
        category === "PREVENTIVE" || category === "CORRECTIVE"
          ? category
          : undefined,
    },
    include: { vehicle: true, provider: true },
    orderBy: { performedAt: order === "asc" ? "asc" : "desc" },
  });

  const filteredItems = items.filter((item) => {
    if (!status) return true;
    if (status === "done") return item.isDone;
    if (item.isDone) return false;
    if (!item.nextDueDate) return status === "noduedate";
    const diffDays = Math.ceil(
      (item.nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (status === "overdue") return diffDays < 0;
    if (status === "upcoming") return diffDays >= 0 && diffDays <= 30;
    if (status === "valid") return diffDays > 30;
    return true;
  });

  const serializedItems = filteredItems.map((item) => ({
    ...item,
    cost: item.cost ? Number(item.cost) : null,
  }));

  const totalCost = filteredItems.reduce(
    (acc, item) => acc + Number(item.cost || 0),
    0
  );
  const averageCost =
    filteredItems.length > 0 ? totalCost / filteredItems.length : 0;

  const overdueCount = items.filter((i) => {
    if (i.isDone || !i.nextDueDate) return false;
    return i.nextDueDate < new Date();
  }).length;

  return (
    <main className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Mantenimientos</h1>
          {overdueCount > 0 && (
            <p className="text-sm text-destructive mt-0.5 font-medium">
              ⚠ {overdueCount} vencido{overdueCount > 1 ? "s" : ""} sin resolver
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/maintenances/new">+ Nuevo</Link>
        </Button>
      </div>

      {/* Filtros */}
      <form
        className="app-section grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        method="GET"
      >
        <input
          name="vehicle"
          defaultValue={vehicle || ""}
          placeholder="Vehículo / patente"
          className="app-input"
        />
        <input
          name="provider"
          defaultValue={provider || ""}
          placeholder="Proveedor"
          className="app-input"
        />
        <select name="category" defaultValue={category || ""} className="app-input">
          <option value="">Todos los tipos</option>
          <option value="PREVENTIVE">Preventivo</option>
          <option value="CORRECTIVE">Correctivo</option>
        </select>
        <select name="status" defaultValue={status || ""} className="app-input">
          <option value="">Todos los estados</option>
          <option value="valid">Vigentes</option>
          <option value="upcoming">Próximos a vencer</option>
          <option value="overdue">Vencidos</option>
          <option value="done">Realizados</option>
        </select>
        <select name="order" defaultValue={order || "desc"} className="app-input">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
        <Button type="submit" className="w-full">Buscar</Button>
      </form>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="app-kpi">
          <p className="app-kpi-label">Registros</p>
          <p className="app-kpi-value">{filteredItems.length}</p>
        </div>
        <div className="app-kpi">
          <p className="app-kpi-label">Costo acumulado</p>
          <p className="app-kpi-value text-2xl">
            ₲{totalCost.toLocaleString("es-PY")}
          </p>
        </div>
        <div className="app-kpi">
          <p className="app-kpi-label">Costo promedio</p>
          <p className="app-kpi-value text-2xl">
            ₲{Math.round(averageCost).toLocaleString("es-PY")}
          </p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {serializedItems.map((item) => (
          <MaintenanceCard key={item.id} item={item} />
        ))}
        {serializedItems.length === 0 && (
          <div className="app-section text-center text-muted-foreground py-8">
            No se encontraron mantenimientos con esos filtros.
          </div>
        )}
      </div>
    </main>
  );
}