export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMaintenanceForm from "./EditMaintenanceForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMaintenancePage({ params }: Props) {
  const { id } = await params;

  const [maintenance, vehicles, providers] = await Promise.all([
    prisma.maintenance.findUnique({ where: { id } }),
    prisma.vehicle.findMany({ orderBy: { code: "asc" } }),
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!maintenance) notFound();

  const serialized = {
    ...maintenance,
    cost: maintenance.cost ? Number(maintenance.cost) : null,
  };

  return (
    <EditMaintenanceForm
      maintenance={serialized}
      vehicles={vehicles}
      providers={providers}
    />
  );
}
