export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Exportá mantenimientos filtrados.
        </p>
      </div>

      <form className="app-section space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="vehicle"
            placeholder="Vehículo / matrícula"
            className="app-input"
          />

          <input
            name="provider"
            placeholder="Proveedor"
            className="app-input"
          />

          <div>
            <label className="text-sm text-muted-foreground">
              Mes realizado
            </label>
            <input name="performedMonth" type="month" className="app-input" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Mes a vencer
            </label>
            <input name="dueMonth" type="month" className="app-input" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            formAction="/api/reports/maintenances/excel"
            formMethod="GET"
          >
            Exportar Excel
          </Button>

          <Button
            formAction="/api/reports/maintenances/pdf"
            formMethod="GET"
            variant="outline"
          >
            Exportar PDF
          </Button>
        </div>
      </form>
    </main>
  );
}