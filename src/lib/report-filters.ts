export function getMonthRange(month?: string | null) {
  if (!month) return undefined;

  const [year, monthIndex] = month.split("-").map(Number);

  if (!year || !monthIndex) return undefined;

  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  return { gte: start, lt: end };
}