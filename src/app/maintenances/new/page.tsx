import { prisma } from "@/lib/prisma";
import { createMaintenance } from "@/actions/maintenance-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NewMaintenancePage(){

 const vehicles=
 await prisma.vehicle.findMany();

 const providers=
 await prisma.provider.findMany();

 return(
 <main className="p-8 max-w-xl mx-auto">

  <h1 className="text-2xl font-bold mb-6">
    Nuevo mantenimiento
  </h1>

<form
 action={createMaintenance}
 className="space-y-4"
>

<select
 name="vehicleId"
 className="w-full border p-2 rounded"
>
 {vehicles.map(v=>(
   <option
    key={v.id}
    value={v.id}
   >
    {v.code}
   </option>
 ))}
</select>

<select
 name="providerId"
 className="w-full border p-2 rounded"
>
 {providers.map(p=>(
  <option
   key={p.id}
   value={p.id}
  >
   {p.name}
  </option>
 ))}
</select>

<Input
 name="title"
 placeholder="Cambio de aceite"
/>

<Input
 name="performedAt"
 type="date"
/>

<Input
 name="nextDueDate"
 type="date"
/>

<Input
 name="cost"
 type="number"
 placeholder="Costo"
/>

<Button className="w-full">
Guardar mantenimiento
</Button>

</form>

 </main>
 )
}