import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/report-filters";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const vehicle = searchParams.get("vehicle");
  const provider = searchParams.get("provider");
  const performedMonth = searchParams.get("performedMonth");
  const dueMonth = searchParams.get("dueMonth");

  const items = await prisma.maintenance.findMany({
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

  const totalCost = items.reduce(
    (acc, item) =>
      acc + Number(item.cost || 0),
    0
  );

  const doc = new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "Reporte de Mantenimientos",
    14,
    20
  );

  doc.setFontSize(11);

  doc.text(
    `Emitido: ${new Date().toLocaleDateString("es-AR")}`,
    14,
    30
  );

  doc.text(
    `Registros: ${items.length}`,
    14,
    38
  );

  doc.text(
    `Costo total: $${totalCost.toLocaleString("es-AR")}`,
    14,
    46
  );


  autoTable(doc,{
    startY:60,

    head:[[
      "Vehículo",
      "Servicio",
      "Proveedor",
      "Fecha",
      "Costo"
    ]],

    body:items.map(item=>[
      item.vehicle.code,
      item.title,
      item.provider?.name || "-",
      item.performedAt.toLocaleDateString("es-AR"),
      `$${Number(item.cost||0)
       .toLocaleString("es-AR")}`
    ])

  });


 const pdfBuffer=
 Buffer.from(
  doc.output("arraybuffer")
 );

 return new Response(
  pdfBuffer,
  {
   headers:{
    "Content-Type":"application/pdf",
    "Content-Disposition":
      'attachment; filename="reporte-mantenimientos.pdf"'
   }
  }
 );

}