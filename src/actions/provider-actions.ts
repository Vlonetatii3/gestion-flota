"use server";

import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProvider(formData: FormData) {
 await prisma.provider.create({
  data:{
   name:String(formData.get("name")),
   contactName:String(formData.get("contactName") || ""),
   email:String(formData.get("email") || ""),
   phone:String(formData.get("phone") || ""),
   services:String(formData.get("services") || "")
  }
 });

 redirect("/providers");
}

export async function updateProvider(
 id:string,
 formData:FormData
){
 await prisma.provider.update({
  where:{id},
  data:{
   name:String(formData.get("name")),
   contactName:String(formData.get("contactName") || ""),
   email:String(formData.get("email") || ""),
   phone:String(formData.get("phone") || ""),
   services:String(formData.get("services") || "")
  }
 });

 redirect("/providers");
}

export async function deleteProvider(id: string) {
  await prisma.provider.delete({
    where: { id },
  });

  revalidatePath("/providers");
}