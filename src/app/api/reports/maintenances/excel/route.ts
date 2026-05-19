import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/report-filters";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const CATEGORY_ES: Record<string, string> = {
  PREVENTIVE: "Preventivo",
  CORRECTIVE: "Correctivo",
};

export async function GET(request: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vehicle = searchParams.get("vehicle");
  const provider = searchParams.get("provider");
  const performedMonth = searchParams.get("performedMonth");
  const dueMonth = searchParams.get("dueMonth");
  const category = searchParams.get("category");

  const maintenances = await prisma.maintenance.findMany({
    where: {
      vehicle: vehicle
        ? {
            OR: [
              { code: { contains: vehicle, mode: "insensitive" } },
              { plate: { contains: vehicle, mode: "insensitive" } },
            ],
          }
        : undefined,
      provider: provider
        ? { name: { contains: provider, mode: "insensitive" } }
        : undefined,
      category:
        category === "PREVENTIVE" || category === "CORRECTIVE"
          ? category
          : undefined,
      performedAt: getMonthRange(performedMonth),
      nextDueDate: getMonthRange(dueMonth),
    },
    include: { vehicle: true, provider: true },
    orderBy: { performedAt: "desc" },
  });

const rows = maintenances.map((item) => ({
    Servicio: item.title,
    Tipo: CATEGORY_ES[item.category] ?? item.category,
    Estado: item.isDone ? "Realizado" : "Pendiente",
    Codigo: item.vehicle.code,
    Patente: item.vehicle.plate || "",
    Marca: item.vehicle.brand || "",
    Modelo: item.vehicle.model || "",
    Proveedor: item.provider?.name || "",
    FechaRealizada: item.performedAt.toLocaleDateString("es-PY"),
    ProximoVencimiento: item.nextDueDate?.toLocaleDateString("es-PY") || "",
    HorasMotor: item.currentEngineHours ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mantenimientos");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="reporte-mantenimientos.xlsx"',
    },
  });
}