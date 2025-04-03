const joursMap: Record<string, string> = {
  Lundi: "Monday",
  Mardi: "Tuesday",
  Mercredi: "Wednesday",
  Jeudi: "Thursday",
  Vendredi: "Friday",
  Samedi: "Saturday",
  Dimanche: "Sunday",
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

export function formatDisponibilitesFromForm(
  formData: Record<string, any>
): string {
  const dispoFields = [
    "les_disponibilites",
    "les_disponibilites_1",
    "les_disponibilites_2",
  ];
  const disponibilites = dispoFields
    .map((field) => formData[field])
    .find((v) => v && typeof v === "object");

  if (!disponibilites) return "";

  const lang: "fr" | "en" = "fr";

  let note = "";

  for (const jour of Object.keys(disponibilites)) {
    let horaires = disponibilites[jour];

    if (typeof horaires === "string") {
      try {
        horaires = JSON.parse(horaires);
      } catch {
        continue;
      }
    }

    if (!Array.isArray(horaires) || horaires.length === 0) continue;

    const jourEN = joursMap[jour] || jour;
    const jourFR = joursMap[jourEN] || jour;
    const jourLabel = lang === "fr" ? jourFR : jourEN;
    note += `- ${jourLabel}: ${horaires.join(", ")}\n`;
  }

  return note.trim();
}
