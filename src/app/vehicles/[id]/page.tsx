import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VehicleEditForm from "./VehicleEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) notFound();
  return <VehicleEditForm vehicle={vehicle} />;
}