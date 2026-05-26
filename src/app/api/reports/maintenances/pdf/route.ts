import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/report-filters";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORY_ES: Record<string, string> = {
  PREVENTIVE: "Preventivo",
  CORRECTIVE: "Correctivo",
};

function getEstado(isDone: boolean, doneAt: Date | null, nextDueDate: Date | null): string {
  if (isDone) {
    if (nextDueDate && doneAt && doneAt > nextDueDate) return "Realizado fuera de plazo";
    return "Realizado";
  }
  if (nextDueDate && nextDueDate < new Date()) return "Vencido";
  return "Vigente";
}

export async function GET(request: Request) {
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

  const items = await prisma.maintenance.findMany({
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

  const now = new Date();
  const preventiveCount = items.filter((i) => i.category === "PREVENTIVE").length;
  const correctiveCount = items.filter((i) => i.category === "CORRECTIVE").length;
  const doneCount = items.filter((i) => i.isDone && !(i.nextDueDate && i.doneAt && i.doneAt > i.nextDueDate)).length;
  const lateCount = items.filter((i) => i.isDone && i.nextDueDate && i.doneAt && i.doneAt > i.nextDueDate).length;
  const overdueCount = items.filter((i) => !i.isDone && i.nextDueDate && i.nextDueDate < now).length;
  const validCount = items.filter((i) => !i.isDone && (!i.nextDueDate || i.nextDueDate >= now)).length;

  const doc = new jsPDF({ orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header azul ──────────────────────────────────────────
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Mantenimientos - Ground Handling", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Dinac", 14, 26);
  doc.text(
    `Emitido: ${new Date().toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    14,
    33
  );

  const filterParts: string[] = [];
  if (vehicle) filterParts.push(`Vehículo: ${vehicle}`);
  if (provider) filterParts.push(`Proveedor: ${provider}`);
  if (category) filterParts.push(`Tipo: ${CATEGORY_ES[category] ?? category}`);
  if (filterParts.length > 0) {
    doc.setFontSize(9);
    doc.text(filterParts.join("   |   "), pageW - 14, 33, { align: "right" });
  }

  // ── KPIs ─────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  const kpiY = 48;
  const kpiW = (pageW - 28 - 15) / 6;

  const kpis = [
    { label: "Total", value: String(items.length), color: [30, 64, 175] as [number, number, number] },
    { label: "Vigentes", value: String(validCount), color: [22, 163, 74] as [number, number, number] },
    { label: "Vencidos", value: String(overdueCount), color: [185, 28, 28] as [number, number, number] },
    { label: "Realizados", value: String(doneCount), color: [37, 99, 235] as [number, number, number] },
    { label: "Fuera de plazo", value: String(lateCount), color: [161, 98, 7] as [number, number, number] },
    { label: "Prev. / Corr.", value: `${preventiveCount} / ${correctiveCount}`, color: [100, 100, 100] as [number, number, number] },
  ];

  kpis.forEach((kpi, i) => {
    const x = 14 + i * (kpiW + 3);
    doc.setFillColor(245, 247, 255);
    doc.roundedRect(x, kpiY, kpiW, 22, 2, 2, "F");
    doc.setFillColor(...kpi.color);
    doc.roundedRect(x, kpiY, 3, 22, 1, 1, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + 8, kpiY + 13);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, x + 8, kpiY + 19);
  });

  // ── Tabla ─────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);

  autoTable(doc, {
    startY: kpiY + 30,
    margin: { left: 14, right: 14 },
    head: [["#", "Vehículo", "Servicio", "Tipo", "Estado", "Proveedor", "Fecha realizada", "Horas motor", "Próximo (HS)"]],
    body: items.map((item, idx) => [
      String(idx + 1),
      `${item.vehicle.code}${item.vehicle.plate ? `\n${item.vehicle.plate}` : ""}${item.vehicle.brand || item.vehicle.model ? `\n${[item.vehicle.brand, item.vehicle.model].filter(Boolean).join(" ")}` : ""}`,
      item.title,
      CATEGORY_ES[item.category] ?? item.category,
      getEstado(item.isDone, item.doneAt, item.nextDueDate),
      item.provider?.name || "-",
      item.performedAt.toLocaleDateString("es-PY"),
      item.currentEngineHours ? String(item.currentEngineHours) : "-",
      item.nextDueEngineHours ? String(item.nextDueEngineHours) : "-",
    ]),
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 35 },
      6: { cellWidth: 25, halign: "center" },
      7: { cellWidth: 20, halign: "center" },
      8: { cellWidth: 20, halign: "center" },
    },
    willDrawCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 4) {
        const text = data.cell.text[0];
        if (text === "Realizado") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = "bold";
        } else if (text === "Realizado fuera de plazo") {
          data.cell.styles.textColor = [161, 98, 7];
          data.cell.styles.fontStyle = "bold";
        } else if (text === "Vencido") {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = "bold";
        } else if (text === "Vigente") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = "normal";
        } else {
          data.cell.styles.textColor = [30, 30, 30];
        }
      }
      if (data.column.index === 3) {
        if (data.cell.text[0] === "Correctivo") {
          data.cell.styles.textColor = [180, 60, 10];
        }
      }
    },
  });

  // ── Footer en cada página ─────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
    doc.text(
      "Dinac — Documento confidencial",
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-mantenimientos.pdf"',
    },
  });
}