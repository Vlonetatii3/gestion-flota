"use client";

import { deleteVehicle } from "@/actions/vehicle-actions";
import { Button } from "@/components/ui/button";

import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export function DeleteVehicleDialog({
 vehicleId,
}:{
 vehicleId:string
}) {

 const deleteAction = deleteVehicle.bind(
   null,
   vehicleId
 );

 return (
  <AlertDialog>

   <AlertDialogTrigger asChild>
     <Button
      variant="destructive"
      size="sm"
     >
      Eliminar
     </Button>
   </AlertDialogTrigger>

   <AlertDialogContent>

    <AlertDialogHeader>
      <AlertDialogTitle>
        ¿Eliminar vehículo?
      </AlertDialogTitle>

      <AlertDialogDescription>
        Esta acción no se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>

      <AlertDialogCancel>
        Cancelar
      </AlertDialogCancel>

      <form action={deleteAction}>
        <AlertDialogAction asChild>
          <button type="submit">
            Sí, eliminar
          </button>
        </AlertDialogAction>
      </form>

    </AlertDialogFooter>

   </AlertDialogContent>

  </AlertDialog>
 )
}