"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createMaintenance(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") || "");
  const providerId = String(formData.get("providerId") || "");
  const title = String(formData.get("title") || "");
  const performedAt = String(formData.get("performedAt") || "");
  const nextDueDate = String(formData.get("nextDueDate") || "");
  const cost = String(formData.get("cost") || "");

  if (!vehicleId) {
    throw new Error("Debe seleccionar un vehículo.");
  }

  if (!title) {
    throw new Error("Debe ingresar un título.");
  }

  if (!performedAt) {
    throw new Error("Debe ingresar la fecha realizada.");
  }

  await prisma.maintenance.create({
    data: {
      vehicleId,
      providerId: providerId ? providerId : null,
      title,
      performedAt: new Date(performedAt),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      cost: cost ? Number(cost) : null,
    },
  });

  redirect("/maintenances");
}