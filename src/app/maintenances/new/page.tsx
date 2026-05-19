export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import NewMaintenanceForm from "./NewMaintenanceForm";

export default async function NewMaintenancePage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { code: "asc" },
  });
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
  });

  return <NewMaintenanceForm vehicles={vehicles} providers={providers} />;
}