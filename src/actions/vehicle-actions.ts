"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createVehicle(formData: FormData) {
  await prisma.vehicle.create({
    data: {
      code: String(formData.get("code")),
      type: String(formData.get("type")),
      brand: String(formData.get("brand") || ""),
      model: String(formData.get("model") || ""),
      plate: String(formData.get("plate") || ""),
      mileage: Number(formData.get("mileage") || 0),
    },
  });

  redirect("/vehicles");
}

export async function updateVehicle(id: string, formData: FormData) {
  await prisma.vehicle.update({
    where: { id },
    data: {
      code: String(formData.get("code")),
      type: String(formData.get("type")),
      brand: String(formData.get("brand") || ""),
      model: String(formData.get("model") || ""),
      plate: String(formData.get("plate") || ""),
      mileage: Number(formData.get("mileage") || 0),
    },
  });

  redirect("/vehicles");
}

export async function deleteVehicle(id: string) {
  await prisma.vehicle.delete({
    where: { id },
  });

  revalidatePath("/vehicles");
}