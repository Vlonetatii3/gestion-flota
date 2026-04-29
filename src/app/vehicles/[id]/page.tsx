import { prisma } from "@/lib/prisma";
import { updateVehicle } from "@/actions/vehicle-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    notFound();
  }

  const updateVehicleWithId = updateVehicle.bind(null, vehicle.id);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar vehículo</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={updateVehicleWithId} className="space-y-4">
            <Input name="code" defaultValue={vehicle.code} required />
            <Input name="type" defaultValue={vehicle.type} required />
            <Input name="brand" defaultValue={vehicle.brand || ""} />
            <Input name="model" defaultValue={vehicle.model || ""} />
            <Input name="plate" defaultValue={vehicle.plate || ""} />
            <Input
              name="mileage"
              type="number"
              defaultValue={vehicle.mileage}
            />

            <Button type="submit" className="w-full">
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}