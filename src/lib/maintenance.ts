export function getMaintenanceStatus(nextDueDate: Date | null) {
  if (!nextDueDate) {
    return {
      label: "Sin vencimiento",
      className: "border text-muted-foreground",
    };
  }

  const today = new Date();
  const diffMs = nextDueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: "Vencido",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  if (diffDays <= 30) {
    return {
      label: `Vence en ${diffDays} días`,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }

  return {
    label: "Vigente",
    className: "bg-green-100 text-green-700 border-green-200",
  };
}