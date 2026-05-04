export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/report-filters";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{
    vehicle?: string;
    provider?: string;
    performedMonth?: string;
    dueMonth?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: Props) {
  const { vehicle, provider, performedMonth, dueMonth } = await searchParams;

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { code: "asc" },
  });

  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
  });

  const maintenances = await prisma.maintenance.findMany({
    where: {
      vehicle: vehicle
        ? {
            OR: [
              { code: { contains: vehicle, mode: "insensitive" } },
              { plate: { contains: vehicle, mode: "insensitive" } },
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

      performedAt: getMonthRange(performedMonth),
      nextDueDate: getMonthRange(dueMonth),
    },
    include: {
      vehicle: true,
      provider: true,
    },
    orderBy: {
      performedAt: "desc",
    },
    take: 25,
  });

  const totalCost = maintenances.reduce(
    (acc, item) => acc + Number(item.cost || 0),
    0
  );

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Armá un reporte, previsualizalo y exportalo a Excel o PDF.
        </p>
      </div>

      <form className="app-section space-y-4" method="GET">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">
              Vehículo / matrícula
            </label>
            <input
              name="vehicle"
              defaultValue={vehicle || ""}
              list="vehicles-list"
              placeholder="Ej: ABC123 o VH-001"
              className="app-input"
            />

            <datalist id="vehicles-list">
              {vehicles.map((v) => (
                <option
                  key={v.id}
                  value={v.plate || v.code}
                >
                  {v.code}
                  {v.plate && v.plate !== v.code ? ` — ${v.plate}` : ""}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Proveedor
            </label>
            <input
              name="provider"
              defaultValue={provider || ""}
              list="providers-list"
              placeholder="Ej: Taller Norte"
              className="app-input"
            />

            <datalist id="providers-list">
              {providers.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Mes realizado
            </label>
            <input
              name="performedMonth"
              defaultValue={performedMonth || ""}
              type="month"
              className="app-input"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Mes a vencer
            </label>
            <input
              name="dueMonth"
              defaultValue={dueMonth || ""}
              type="month"
              className="app-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">
            Previsualizar
          </Button>

          <Button
            formAction="/api/reports/maintenances/excel"
            formMethod="GET"
            variant="outline"
          >
            Exportar Excel
          </Button>

          <Button
            formAction="/api/reports/maintenances/pdf"
            formMethod="GET"
            variant="outline"
          >
            Exportar PDF
          </Button>
        </div>
      </form>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="app-kpi">
          <p className="app-kpi-label">Registros encontrados</p>
          <p className="app-kpi-value">{maintenances.length}</p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Costo total preview</p>
          <p className="app-kpi-value">
            ${totalCost.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Límite preview</p>
          <p className="app-kpi-value">25</p>
        </div>
      </section>

      <section className="app-section space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Preview del reporte</h2>
          <p className="text-sm text-muted-foreground">
            Se muestran hasta 25 registros. Excel y PDF exportan todos los que
            coincidan con los filtros.
          </p>
        </div>

        <div className="app-table">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Servicio</th>
                <th className="p-3 text-left">Vehículo</th>
                <th className="p-3 text-left">Proveedor</th>
                <th className="p-3 text-left">Realizado</th>
                <th className="p-3 text-left">Vence</th>
                <th className="p-3 text-left">Costo</th>
              </tr>
            </thead>

            <tbody>
              {maintenances.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.title}</td>

                  <td className="p-3">
                    {item.vehicle.code}
                    {item.vehicle.plate &&
                    item.vehicle.plate !== item.vehicle.code
                      ? ` — ${item.vehicle.plate}`
                      : ""}
                  </td>

                  <td className="p-3">
                    {item.provider?.name || "Sin proveedor"}
                  </td>

                  <td className="p-3">
                    {item.performedAt.toLocaleDateString("es-AR")}
                  </td>

                  <td className="p-3">
                    {item.nextDueDate?.toLocaleDateString("es-AR") || "-"}
                  </td>

                  <td className="p-3">
                    $
                    {item.cost
                      ? Number(item.cost).toLocaleString("es-AR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {maintenances.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay registros para los filtros seleccionados.
          </p>
        )}
      </section>
    </main>
  );
}