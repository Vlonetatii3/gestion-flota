import { createProvider } from "@/actions/provider-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewProviderPage(){

 return(
  <main className="p-8 max-w-xl mx-auto">

   <h1 className="text-2xl font-bold mb-6">
    Nuevo proveedor
   </h1>

   <form
    action={createProvider}
    className="space-y-4"
   >

    <Input
      name="name"
      placeholder="Proveedor"
      required
    />

    <Input
      name="contactName"
      placeholder="Contacto"
    />

    <Input
      name="email"
      placeholder="Email"
    />

    <Input
      name="phone"
      placeholder="Teléfono"
    />

    <Input
      name="services"
      placeholder="Servicios"
    />

    <Button
      type="submit"
      className="w-full"
    >
      Guardar
    </Button>

   </form>

  </main>
 )
}