import { prisma } from "@/lib/prisma";
import { updateProvider } from "@/actions/provider-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

type Props={
 params:Promise<{
  id:string
 }>
}

export default async function EditProviderPage(
 {params}:Props
){

 const {id}=await params;

 const provider=
 await prisma.provider.findUnique({
   where:{id}
 });

 if(!provider) notFound();

 const action=
 updateProvider.bind(
   null,
   provider.id
 );

 return(
  <main className="p-8 max-w-xl mx-auto">

   <h1 className="text-2xl font-bold mb-6">
    Editar proveedor
   </h1>

   <form
    action={action}
    className="space-y-4"
   >

    <Input
      name="name"
      defaultValue={provider.name}
    />

    <Input
      name="contactName"
      defaultValue={provider.contactName || ""}
    />

    <Input
      name="email"
      defaultValue={provider.email || ""}
    />

    <Input
      name="phone"
      defaultValue={provider.phone || ""}
    />

    <Input
      name="services"
      defaultValue={provider.services || ""}
    />

    <Button className="w-full">
      Guardar cambios
    </Button>

   </form>

  </main>
 )
}