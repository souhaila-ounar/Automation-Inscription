export function getFormattedDateTimeCanada(lang: "fr" | "en" = "fr"): string {
  const now = new Date();

  const locale = lang === "fr" ? "fr-CA" : "en-CA";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Toronto",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat(locale, options);
  const parts = formatter.formatToParts(now);

  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  if (lang === "fr") {
    return `${day} ${month} ${year} à ${hour} h ${minute}`;
  } else {
    return `${month} ${day}, ${year} at ${hour}:${minute}`;
  }
}

export function getISODateTimeCanada(offsetDays: number = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const offsetMinutes = 5 * 60;
  const localTime = new Date(now.getTime() - offsetMinutes * 60 * 1000);
  const iso = localTime.toISOString().split(".")[0];
  return `${iso}-05:00`;
}
