import { createVehicle } from "@/actions/vehicle-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewVehiclePage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo vehículo</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createVehicle} className="space-y-4">
            <Input name="code" placeholder="Código interno" required />
            <Input name="type" placeholder="Tipo de vehículo/equipo" required />
            <Input name="brand" placeholder="Marca" />
            <Input name="model" placeholder="Modelo" />
            <Input name="plate" placeholder="Patente" />
            <Input name="mileage" type="number" placeholder="Kilometraje" />

            <Button type="submit" className="w-full">
              Guardar vehículo
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}