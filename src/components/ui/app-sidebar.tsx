import Link from "next/link";
import {
  Car,
  Gauge,
  Wrench,
  Bell,
  Building2,
  BarChart3,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/vehicles", label: "Vehículos", icon: Car },
  { href: "/providers", label: "Proveedores", icon: Building2 },
  { href: "/maintenances", label: "Mantenimientos", icon: Wrench },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/reports", label: "Reportes", icon: Gauge },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Flota</h1>
        <p className="text-sm text-muted-foreground">Gestión vehicular</p>
      </div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}