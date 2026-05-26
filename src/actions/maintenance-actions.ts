"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Debe seleccionar un vehículo"),
  providerId: z.string().optional(),
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["PREVENTIVE", "CORRECTIVE"]).default("PREVENTIVE"),
  performedAt: z.string().min(1, "La fecha realizada es requerida"),
  nextDueDate: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  currentEngineHours: z.coerce.number().int().min(0).optional(),
  nextDueEngineHours: z.coerce.number().int().min(0).optional(),
});

export type MaintenanceActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createMaintenance(
  _prev: MaintenanceActionResult | null,
  formData: FormData
): Promise<MaintenanceActionResult> {
  const raw = {
    vehicleId: formData.get("vehicleId"),
    providerId: formData.get("providerId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || "PREVENTIVE",
    performedAt: formData.get("performedAt"),
    nextDueDate: formData.get("nextDueDate") || undefined,
    cost: formData.get("cost") || undefined,
    currentEngineHours: formData.get("currentEngineHours") || undefined,
    nextDueEngineHours: formData.get("nextDueEngineHours") || undefined,
  };

  const parsed = MaintenanceSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { vehicleId, providerId, performedAt, nextDueDate, ...rest } = parsed.data;

  try {
    await prisma.maintenance.create({
      data: {
        vehicleId,
        providerId: providerId || null,
        performedAt: new Date(performedAt),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        ...rest,
      },
    });
  } catch (e) {
    console.error("Error crear mantenimiento:", e);
    return { error: "Error al crear el mantenimiento. Intentá nuevamente." };
  }

  redirect("/maintenances");
}

export async function deleteMaintenance(id: string) {
  await prisma.maintenance.delete({ where: { id } });
  revalidatePath("/maintenances");
  revalidatePath("/alerts");
}

export async function markMaintenanceDone(id: string) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
    select: { nextDueDate: true },
  });

  await prisma.maintenance.update({
    where: { id },
    data: {
      isDone: true,
      doneAt: new Date(),
    },
  });
  revalidatePath("/maintenances");
  revalidatePath("/alerts");
}

export async function markMaintenancePending(id: string) {
  await prisma.maintenance.update({
    where: { id },
    data: {
      isDone: false,
      doneAt: null,
    },
  });
  revalidatePath("/maintenances");
  revalidatePath("/alerts");
}
export async function updateMaintenance(
  id: string,
  _prev: MaintenanceActionResult | null,
  formData: FormData
): Promise<MaintenanceActionResult> {
  const raw = {
    vehicleId: formData.get("vehicleId"),
    providerId: formData.get("providerId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || "PREVENTIVE",
    performedAt: formData.get("performedAt"),
    nextDueDate: formData.get("nextDueDate") || undefined,
    cost: formData.get("cost") || undefined,
    currentEngineHours: formData.get("currentEngineHours") || undefined,
    nextDueEngineHours: formData.get("nextDueEngineHours") || undefined,
  };

  const parsed = MaintenanceSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { vehicleId, providerId, performedAt, nextDueDate, ...rest } = parsed.data;

  try {
    await prisma.maintenance.update({
      where: { id },
      data: {
        vehicleId,
        providerId: providerId || null,
        performedAt: new Date(performedAt),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        ...rest,
      },
    });
  } catch {
    return { error: "Error al actualizar el mantenimiento." };
  }

  redirect("/maintenances");
}