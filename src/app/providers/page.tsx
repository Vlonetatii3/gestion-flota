import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteProvider } from "@/actions/provider-actions";
import { DeleteProviderDialog } from "@/components/ui/delete-provider-dialog";
export default async function ProvidersPage(){

 const providers=await prisma.provider.findMany({
   orderBy:{
      createdAt:"desc"
   }
 });

 return(
  <main className="p-8 space-y-6">

   <div className="flex justify-between">
      <h1 className="text-3xl font-bold">
        Proveedores
      </h1>

      <Button asChild>
        <Link href="/providers/new">
         Nuevo proveedor
        </Link>
      </Button>
   </div>

   <div className="border rounded-xl overflow-hidden">

   <table className="w-full">
      <thead className="bg-muted">
       <tr>
         <th className="p-4 text-left">Nombre</th>
         <th className="p-4 text-left">Contacto</th>
         <th className="p-4 text-left">Email</th>
         <th className="p-4 text-left">Teléfono</th>
         <th className="p-4 text-left">
          Acciones
         </th>
       </tr>
      </thead>

      <tbody>
      {providers.map((provider)=>(
        <tr
         key={provider.id}
         className="border-t"
        >
          <td className="p-4">
            {provider.name}
          </td>

          <td className="p-4">
            {provider.contactName}
          </td>

          <td className="p-4">
            {provider.email}
          </td>

          <td className="p-4">
            {provider.phone}
          </td>
          <td className="p-4">
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/providers/${provider.id}`}>Editar</Link>
              </Button>

              <DeleteProviderDialog providerId={provider.id} />
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