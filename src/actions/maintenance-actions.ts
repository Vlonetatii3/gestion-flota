"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createMaintenance(
 formData:FormData
){

 await prisma.maintenance.create({
   data:{
     vehicleId:String(
       formData.get("vehicleId")
     ),

     providerId:String(
       formData.get("providerId")
     ),

     title:String(
       formData.get("title")
     ),

     performedAt:new Date(
       String(formData.get("performedAt"))
     ),

     cost:formData.get("cost")
      ? Number(formData.get("cost"))
      : null,

     nextDueDate:new Date(
       String(formData.get("nextDueDate"))
     )
   }
 });

 redirect("/maintenances");
}