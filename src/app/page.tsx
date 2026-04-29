import { prisma } from "@/lib/prisma";
import { getMaintenanceStatus } from "@/lib/maintenance";

export default async function HomePage() {
  const vehicles = await prisma.vehicle.count();
  const providers = await prisma.provider.count();

  const maintenances = await prisma.maintenance.findMany({
    include: {
      vehicle: true,
      provider: true,
    },
    orderBy: {
      performedAt: "desc",
    },
  });

  const today = new Date();

  const overdue = maintenances.filter(
    (item) => item.nextDueDate && item.nextDueDate < today
  );

  const upcoming = maintenances.filter((item) => {
    if (!item.nextDueDate) return false;

    const diffDays = Math.ceil(
      (item.nextDueDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return diffDays >= 0 && diffDays <= 30;
  });

  const totalCost = maintenances.reduce(
    (acc, item) => acc + Number(item.cost || 0),
    0
  );

  const recentMaintenances = maintenances.slice(0, 5);

  const upcomingMaintenances = maintenances
    .filter((item) => item.nextDueDate)
    .sort(
      (a, b) =>
        a.nextDueDate!.getTime() - b.nextDueDate!.getTime()
    )
    .slice(0, 5);

  const averageCost =
    maintenances.length > 0 ? totalCost / maintenances.length : 0;

  return (
    <main className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Gestión de Flota</h1>
        <p className="text-muted-foreground mt-2">
          Panel general de vehículos, proveedores, mantenimientos y alertas.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="app-kpi">
          <p className="app-kpi-label">Vehículos</p>
          <p className="app-kpi-value">{vehicles}</p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Proveedores</p>
          <p className="app-kpi-value">{providers}</p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Mantenimientos</p>
          <p className="app-kpi-value">{maintenances.length}</p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Costo total</p>
          <p className="app-kpi-value">
            ${totalCost.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="app-kpi">
          <p className="app-kpi-label">Vencidos</p>
          <p className="text-4xl font-bold text-red-600">{overdue.length}</p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Próximos a vencer</p>
          <p className="text-4xl font-bold text-yellow-600">
            {upcoming.length}
          </p>
        </div>

        <div className="app-kpi">
          <p className="app-kpi-label">Costo promedio</p>
          <p className="text-4xl font-bold">
            ${averageCost.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="border rounded-xl p-5 bg-background space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Próximos vencimientos</h2>
            <p className="app-kpi-label">
              Mantenimientos ordenados por fecha de vencimiento.
            </p>
          </div>

          <div className="space-y-3">
            {upcomingMaintenances.map((item) => {
              const status = getMaintenanceStatus(item.nextDueDate);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="app-kpi-label">
                      {item.vehicle.code}
                      {item.vehicle.plate &&
                      item.vehicle.plate !== item.vehicle.code
                        ? ` — ${item.vehicle.plate}`
                        : ""}
                    </p>
                    <p className="text-sm">
                      {item.nextDueDate?.toLocaleDateString("es-AR")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}

            {upcomingMaintenances.length === 0 && (
              <p className="app-kpi-label">
                No hay vencimientos cargados.
              </p>
            )}
          </div>
        </section>

        <section className="border rounded-xl p-5 bg-background space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Últimos mantenimientos</h2>
            <p className="app-kpi-label">
              Actividad reciente registrada en el sistema.
            </p>
          </div>

          <div className="space-y-3">
            {recentMaintenances.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="app-kpi-label">
                    {item.vehicle.code} ·{" "}
                    {item.provider?.name || "Sin proveedor"}
                  </p>
                  <p className="text-sm">
                    {item.performedAt.toLocaleDateString("es-AR")}
                  </p>
                </div>

                <p className="font-semibold">
                  $
                  {item.cost
                    ? Number(item.cost).toLocaleString("es-AR")
                    : "-"}
                </p>
              </div>
            ))}

            {recentMaintenances.length === 0 && (
              <p className="app-kpi-label">
                Todavía no hay mantenimientos registrados.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}