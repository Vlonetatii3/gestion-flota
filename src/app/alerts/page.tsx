export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getMaintenanceStatus } from "@/lib/maintenance";

export default async function AlertsPage(){

 const items=
 await prisma.maintenance.findMany({
   include:{
      vehicle:true,
      provider:true
   },
   orderBy:{
      nextDueDate:"asc"
   }
 });

 const overdue=
 items.filter(item=>{
   if(!item.nextDueDate) return false;
   return item.nextDueDate < new Date();
 });

 const upcoming=
 items.filter(item=>{
   if(!item.nextDueDate) return false;

   const diff=Math.ceil(
    (
      item.nextDueDate.getTime()-
      new Date().getTime()
    )/(1000*60*60*24)
   );

   return diff>=0 && diff<=30;
 });

 const valid=
 items.filter(item=>{
   if(!item.nextDueDate) return false;

   const diff=Math.ceil(
    (
      item.nextDueDate.getTime()-
      new Date().getTime()
    )/(1000*60*60*24)
   );

   return diff>30;
 });

 return(
  <main className="p-8 space-y-8">

   <h1 className="text-3xl font-bold">
    Alertas de mantenimiento
   </h1>

<div className="grid md:grid-cols-3 gap-4">

<div className="border rounded-xl p-6">
 <p className="text-sm text-muted-foreground">
 Vencidos
 </p>

 <p className="text-4xl font-bold text-red-600">
 {overdue.length}
 </p>
</div>


<div className="border rounded-xl p-6">
 <p className="text-sm text-muted-foreground">
 Próximos a vencer
 </p>

 <p className="text-4xl font-bold text-yellow-600">
 {upcoming.length}
 </p>
</div>


<div className="border rounded-xl p-6">
 <p className="text-sm text-muted-foreground">
 Vigentes
 </p>

 <p className="text-4xl font-bold text-green-600">
 {valid.length}
 </p>
</div>

</div>


<div className="space-y-4">

<h2 className="text-xl font-semibold">
Atención inmediata
</h2>

{[...overdue,...upcoming].map(item=>{

const status=
getMaintenanceStatus(
 item.nextDueDate
);

return(
<div
 key={item.id}
 className="border rounded-xl p-4"
>

<h3 className="font-semibold">
{item.title}
</h3>

<p>
Vehículo:
{" "}
{item.vehicle.code}
</p>

<p>
Próximo:
{" "}
{item.nextDueDate?.toLocaleDateString("es-AR")}
</p>

<span
className={`
inline-flex mt-2 rounded-full border
px-3 py-1 text-xs
${status.className}
`}
>
{status.label}
</span>

</div>
)

})}

</div>

  </main>
 )
}