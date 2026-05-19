export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMaintenanceStatus } from "@/lib/maintenance";
import {
  Truck,
  Building2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  Wrench,
} from "lucide-react";

export default async function DashboardPage() {
  const [vehicleCount, providerCount, allMaintenances, recentMaintenances] =
    await Promise.all([
      prisma.vehicle.count(),
      prisma.provider.count(),
      prisma.maintenance.findMany({
        where: { isDone: false, nextDueDate: { not: null } },
        include: { vehicle: true },
        orderBy: { nextDueDate: "asc" },
      }),
      prisma.maintenance.findMany({
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const now = new Date();

  const overdueItems = allMaintenances.filter((m) => m.nextDueDate! < now);
  const upcomingItems = allMaintenances.filter((m) => {
    const diff = Math.ceil(
      (m.nextDueDate!.getTime() - now.getTime()) / 86400000
    );
    return diff >= 0 && diff <= 30;
  });
  const validItems = allMaintenances.filter((m) => {
    const diff = Math.ceil(
      (m.nextDueDate!.getTime() - now.getTime()) / 86400000
    );
    return diff > 30;
  });

  const totalMaintenances = await prisma.maintenance.count();
  const doneMaintenances = await prisma.maintenance.count({
    where: { isDone: true },
  });
  const completionRate =
    totalMaintenances > 0
      ? Math.round((doneMaintenances / totalMaintenances) * 100)
      : 0;

  return (
    <main className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {now.toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/maintenances/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo mantenimiento
          </Link>
        </Button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vehículos</p>
            <p className="text-2xl font-semibold">{vehicleCount}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="rounded-lg bg-purple-100 p-3">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Proveedores</p>
            <p className="text-2xl font-semibold">{providerCount}</p>
          </div>
        </div>

        <div
          className={`rounded-xl border bg-card p-5 flex items-center gap-4 ${
            overdueItems.length > 0 ? "border-destructive/40 bg-destructive/5" : ""
          }`}
        >
          <div
            className={`rounded-lg p-3 ${
              overdueItems.length > 0 ? "bg-destructive/15" : "bg-muted"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                overdueItems.length > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vencidos</p>
            <p
              className={`text-2xl font-semibold ${
                overdueItems.length > 0 ? "text-destructive" : ""
              }`}
            >
              {overdueItems.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="rounded-lg bg-yellow-100 p-3">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Próximos 30 días</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {upcomingItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasa de cumplimiento */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Tasa de cumplimiento</p>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-semibold">{completionRate}%</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {doneMaintenances} de {totalMaintenances} realizados
          </p>
        </div>

        {/* Estado de alertas */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Estado de alertas</p>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                Vencidos
              </span>
              <span className="font-semibold">{overdueItems.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                Próximos a vencer
              </span>
              <span className="font-semibold">{upcomingItems.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Vigentes
              </span>
              <span className="font-semibold">{validItems.length}</span>
            </div>
          </div>
          <Link
            href="/alerts"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            Ver alertas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Accesos rápidos */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-sm font-medium">Acciones rápidas</p>
          <div className="space-y-2">
            <Button asChild className="w-full justify-start" size="sm">
              <Link href="/maintenances/new">
                <Plus className="h-4 w-4 mr-2" /> Nuevo mantenimiento
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start"
              size="sm"
              variant="outline"
            >
              <Link href="/vehicles/new">
                <Plus className="h-4 w-4 mr-2" /> Nuevo vehículo
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start"
              size="sm"
              variant="outline"
            >
              <Link href="/reports">
                <ArrowRight className="h-4 w-4 mr-2" /> Exportar reportes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximas alertas */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold">Próximas alertas</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/alerts">
                Ver todas <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>

          {allMaintenances.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 rounded-lg bg-muted/40">
              ✓ Sin alertas pendientes
            </div>
          ) : (
            <div className="space-y-2">
              {allMaintenances.slice(0, 5).map((item) => {
                const status = getMaintenanceStatus(item.nextDueDate);
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.vehicle.code}
                        {item.vehicle.plate ? ` — ${item.vehicle.plate}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Últimos registros */}
        <section className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold">Últimos registros</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/maintenances">
                Ver todos <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {recentMaintenances.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="rounded-md bg-muted p-1.5 shrink-0">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.vehicle.code}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.performedAt.toLocaleDateString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}