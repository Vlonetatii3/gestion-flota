"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const VehicleSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(50),
  type: z.string().min(1, "El tipo es requerido").max(100),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  plate: z.string().max(20).optional(),
  engineHours: z.coerce.number().int().min(0).optional().default(0),
});

export type VehicleActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createVehicle(
  _prev: VehicleActionResult | null,
  formData: FormData
): Promise<VehicleActionResult> {
  const raw = {
    code: formData.get("code"),
    type: formData.get("type"),
    brand: formData.get("brand") || undefined,
    model: formData.get("model") || undefined,
    plate: formData.get("plate") || undefined,
    engineHours: formData.get("engineHours") || 0,
  };

  const parsed = VehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.vehicle.create({ data: parsed.data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { fieldErrors: { code: ["Ya existe un vehículo con ese código."] } };
    }
    return { error: "Error al crear el vehículo. Intentá nuevamente." };
  }

  redirect("/vehicles");
}

export async function updateVehicle(
  id: string,
  _prev: VehicleActionResult | null,
  formData: FormData
): Promise<VehicleActionResult> {
  const raw = {
    code: formData.get("code"),
    type: formData.get("type"),
    brand: formData.get("brand") || undefined,
    model: formData.get("model") || undefined,
    plate: formData.get("plate") || undefined,
    engineHours: formData.get("engineHours") || 0,
  };

  const parsed = VehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.vehicle.update({ where: { id }, data: parsed.data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { fieldErrors: { code: ["Ya existe un vehículo con ese código."] } };
    }
    return { error: "Error al actualizar el vehículo." };
  }

  redirect("/vehicles");
}

export async function deleteVehicle(id: string) {
  await prisma.vehicle.delete({ where: { id } });
  revalidatePath("/vehicles");
}
