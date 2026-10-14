const displayDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDisplayDate(value: string) {
  return displayDateFormatter.format(new Date(value));
}
