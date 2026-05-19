"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProviderSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(150),
  contactName: z.string().max(150).optional(),
  email: z.string().email("Email inválido").max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  services: z.string().max(500).optional(),
});

export type ProviderActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProvider(
  _prev: ProviderActionResult | null,
  formData: FormData
): Promise<ProviderActionResult> {
  const raw = {
    name: formData.get("name"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    services: formData.get("services") || undefined,
  };

  const parsed = ProviderSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.provider.create({ data: parsed.data });
  } catch {
    return { error: "Error al crear el proveedor." };
  }

  redirect("/providers");
}

export async function updateProvider(
  id: string,
  _prev: ProviderActionResult | null,
  formData: FormData
): Promise<ProviderActionResult> {
  const raw = {
    name: formData.get("name"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    services: formData.get("services") || undefined,
  };

  const parsed = ProviderSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.provider.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Error al actualizar el proveedor." };
  }

  redirect("/providers");
}

export async function deleteProvider(id: string) {
  await prisma.provider.delete({ where: { id } });
  revalidatePath("/providers");
}