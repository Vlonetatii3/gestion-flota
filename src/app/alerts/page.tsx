export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { MaintenanceCard } from "@/components/ui/maintenance-card";

export default async function AlertsPage() {
  const items = await prisma.maintenance.findMany({
    where: { isDone: false, nextDueDate: { not: null } },
    include: { vehicle: true, provider: true },
    orderBy: { nextDueDate: "asc" },
  });

  const now = new Date();

  const serializedItems = items.map((item) => ({
    ...item,
    cost: item.cost ? Number(item.cost) : null,
  }));

  const overdue = serializedItems.filter((item) => item.nextDueDate! < now);
  const upcoming = serializedItems.filter((item) => {
    const diff = Math.ceil(
      (item.nextDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 && diff <= 30;
  });
  const valid = serializedItems.filter((item) => {
    const diff = Math.ceil(
      (item.nextDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 30;
  });

  return (
    <main className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Alertas de mantenimiento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mantenimientos pendientes con fecha de vencimiento definida.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-destructive">
          <p className="text-sm text-muted-foreground">Vencidos</p>
          <p className="text-3xl font-semibold text-destructive mt-1">
            {overdue.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-yellow-400">
          <p className="text-sm text-muted-foreground">Próximos a vencer (30 días)</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-1">
            {upcoming.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 border-l-4 border-l-green-400">
          <p className="text-sm text-muted-foreground">Vigentes</p>
          <p className="text-3xl font-semibold text-green-600 mt-1">
            {valid.length}
          </p>
        </div>
      </div>

      {/* Críticos */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-destructive">
            ⚠ Requieren atención
          </h2>
          {[...overdue, ...upcoming].map((item) => (
            <MaintenanceCard key={item.id} item={item} />
          ))}
        </section>
      )}

      {/* Vigentes */}
      {valid.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Vigentes
          </h2>
          {valid.map((item) => (
            <MaintenanceCard key={item.id} item={item} />
          ))}
        </section>
      )}

      {serializedItems.length === 0 && (
        <div className="rounded-xl border bg-card text-center text-muted-foreground py-12">
          ✓ No hay alertas pendientes. Todo está al día.
        </div>
      )}
    </main>
  );
}