import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/report-filters";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const vehicle = searchParams.get("vehicle");
  const provider = searchParams.get("provider");
  const performedMonth = searchParams.get("performedMonth");
  const dueMonth = searchParams.get("dueMonth");

  const maintenances = await prisma.maintenance.findMany({
    where: {
      vehicle: vehicle
        ? {
            OR: [
              {
                code: {
                  contains: vehicle,
                  mode: "insensitive",
                },
              },
              {
                plate: {
                  contains: vehicle,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,

      provider: provider
        ? {
            name: {
              contains: provider,
              mode: "insensitive",
            },
          }
        : undefined,

      performedAt: getMonthRange(performedMonth),

      nextDueDate: getMonthRange(dueMonth),
    },

    include: {
      vehicle: true,
      provider: true,
    },

    orderBy: {
      performedAt: "desc",
    },
  });

  const rows = maintenances.map((item) => ({
    Servicio: item.title,
    Vehiculo: item.vehicle.code,
    Patente: item.vehicle.plate || "",
    Proveedor: item.provider?.name || "",
    FechaRealizada:
      item.performedAt.toLocaleDateString("es-AR"),
    ProximoVencimiento:
      item.nextDueDate?.toLocaleDateString("es-AR") || "",
    Costo: Number(item.cost || 0),
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Mantenimientos"
  );

  const buffer = XLSX.write(
    workbook,
    {
      type: "buffer",
      bookType: "xlsx",
    }
  );

  return new Response(buffer,{
    headers:{
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      "Content-Disposition":
       'attachment; filename="reporte-mantenimientos.xlsx"',
    }
  });

}