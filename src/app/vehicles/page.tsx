import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteVehicleDialog } from "@/components/ui/delete-vehicle-dialog";
export default async function VehiclesPage() {

 const vehicles = await prisma.vehicle.findMany({
   orderBy:{
      createdAt:"desc"
   }
 });

 return (
  <main className="p-8 space-y-6">

    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">
        Vehículos
      </h1>

      <Button asChild>
        <Link href="/vehicles/new">
          Nuevo vehículo
        </Link>
      </Button>
    </div>

    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-muted">
          <tr>
            <th className="p-4 text-left">Código</th>
            <th className="p-4 text-left">Tipo</th>
            <th className="p-4 text-left">Marca</th>
            <th className="p-4 text-left">Modelo</th>
            <th className="p-4 text-left">Patente</th>
            <th className="p-4 text-left">KM</th>
            <th className="p-4 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle)=>(
            <tr
             key={vehicle.id}
             className="border-t"
            >
              <td className="p-4">
                {vehicle.code}
              </td>

              <td className="p-4">
                {vehicle.type}
              </td>

              <td className="p-4">
                {vehicle.brand}
              </td>

              <td className="p-4">
                {vehicle.model}
              </td>

              <td className="p-4">
                {vehicle.plate}
              </td>

              <td className="p-4">
                {vehicle.mileage}
              </td>

              <td className="p-4">
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/vehicles/${vehicle.id}`}>Editar</Link>
                  </Button>

                  <DeleteVehicleDialog vehicleId={vehicle.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </main>
 )
}