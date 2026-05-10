export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function money(value = 0) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function tripStatus(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) return "Upcoming";
  if (now > endDate) return "Completed";
  return "Ongoing";
}
