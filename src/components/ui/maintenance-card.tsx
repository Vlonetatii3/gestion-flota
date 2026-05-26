"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  markMaintenanceDone,
  markMaintenancePending,
  deleteMaintenance,
} from "@/actions/maintenance-actions";
import { getMaintenanceStatus } from "@/lib/maintenance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Building2, Gauge, Pencil } from "lucide-react";

type MaintenanceItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  isDone: boolean;
  doneAt: Date | null;
  performedAt: Date;
  nextDueDate: Date | null;
  cost: number | null;
  currentEngineHours: number | null;
  nextDueEngineHours: number | null;
  vehicle: {
    code: string;
    plate: string | null;
    brand: string | null;
    model: string | null;
  };
  provider: { name: string } | null;
};

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
  PREVENTIVE: {
    label: "Preventivo",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CORRECTIVE: {
    label: "Correctivo",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

export function MaintenanceCard({ item }: { item: MaintenanceItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = (() => {
    if (!item.isDone) return getMaintenanceStatus(item.nextDueDate);
    const lateDate =
      item.nextDueDate &&
      item.doneAt &&
      item.doneAt > item.nextDueDate;
    if (lateDate) {
      return {
        label: "Realizado fuera de plazo",
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      };
    }
    return {
      label: "Realizado",
      className: "bg-green-100 text-green-700 border-green-200",
    };
  })();

  const category = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.PREVENTIVE;

  const vehicleName = [item.vehicle.brand, item.vehicle.model]
    .filter(Boolean)
    .join(" ");

  function handleToggleDone() {
    startTransition(async () => {
      if (item.isDone) {
        await markMaintenancePending(item.id);
      } else {
        await markMaintenanceDone(item.id);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteMaintenance(item.id);
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-xl border bg-card shadow-sm transition-opacity ${
        isPending ? "opacity-60" : ""
      } ${item.isDone ? "opacity-70" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 rounded-lg p-2 shrink-0 ${
            item.isDone
              ? "bg-muted"
              : item.category === "CORRECTIVE"
              ? "bg-orange-100"
              : "bg-blue-100"
          }`}>
            <Wrench className={`h-4 w-4 ${
              item.isDone
                ? "text-muted-foreground"
                : item.category === "CORRECTIVE"
                ? "text-orange-600"
                : "text-blue-600"
            }`} />
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold text-base leading-tight ${
              item.isDone ? "line-through text-muted-foreground" : ""
            }`}>
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${category.className}`}>
            {category.label}
          </span>
        </div>
      </div>

      {/* Detalles */}
      <div className="px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Vehículo */}
        <div className="flex items-start gap-2">
          <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Vehículo</p>
            <p className="text-sm font-medium truncate">{item.vehicle.code}</p>
            {vehicleName && (
              <p className="text-xs text-muted-foreground truncate">{vehicleName}</p>
            )}
            {item.vehicle.plate && (
              <p className="text-xs text-muted-foreground">{item.vehicle.plate}</p>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="flex items-start gap-2">
          <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Realizado</p>
            <p className="text-sm font-medium">
              {item.performedAt.toLocaleDateString("es-PY")}
            </p>
            {item.nextDueDate && (
              <>
                <p className="text-xs text-muted-foreground mt-1">Vence</p>
                <p className="text-sm font-medium">
                  {item.nextDueDate.toLocaleDateString("es-PY")}
                </p>
              </>
            )}
            {item.isDone && item.doneAt && (
              <>
                <p className="text-xs text-muted-foreground mt-1">Marcado hecho</p>
                <p className="text-sm font-medium">
                  {item.doneAt.toLocaleDateString("es-PY")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Proveedor */}
        <div className="flex items-start gap-2">
          <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Proveedor</p>
            <p className="text-sm font-medium truncate">
              {item.provider?.name || "Sin proveedor"}
            </p>
          </div>
        </div>

        {/* Horas motor */}
        <div className="flex items-start gap-2">
          <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Horas motor</p>
            <p className="text-sm font-medium">
              {item.currentEngineHours != null
                ? `${item.currentEngineHours.toLocaleString("es-PY")} h`
                : "—"}
            </p>
            {item.nextDueEngineHours != null && (
              <>
                <p className="text-xs text-muted-foreground mt-1">Próx. venc. (horas)</p>
                <p className="text-sm font-medium">
                  {item.nextDueEngineHours.toLocaleString("es-PY")} h
                </p>
              </>
            )}
            {item.cost != null && item.cost > 0 && (
              <>
                <p className="text-xs text-muted-foreground mt-1">Costo</p>
                <p className="text-sm font-medium">
                  ₲{item.cost.toLocaleString("es-PY")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="flex justify-end gap-2 px-5 py-3 border-t bg-muted/30 rounded-b-xl">
        <Button asChild size="sm" variant="outline" disabled={isPending}>
          <Link href={`/maintenances/${item.id}/edit`}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editar
          </Link>
        </Button>

        <Button
          size="sm"
          variant={item.isDone ? "outline" : "secondary"}
          onClick={handleToggleDone}
          disabled={isPending}
        >
          {item.isDone ? "↩ Deshacer" : "✓ Marcar hecho"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={isPending}>
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mantenimiento?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará &ldquo;{item.title}&rdquo;. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}