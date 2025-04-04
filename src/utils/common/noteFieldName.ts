export function getNoteFieldName(branchName: string): string {
  const map: Record<string, string> = {
    "Tutorax - Tutorat": "notes",
    "Tutorax - Orthopedagogie": "notes_1",
    "Tutorax - Orthophonie": "sign_up",
    "Tutorax - Stimulation du langage": "notes",
    "Tutorax- Canada": "notes",
    "Tutorax - USA": "notes",
  };

  return map[branchName?.trim()] || "notes";
}
