interface FormatSubjectsInput {
  formData: Record<string, any>;
  isSecondMandate?: boolean;
}

export function formatSubjects({
  formData,
  isSecondMandate = false,
}: FormatSubjectsInput): {
  subjects: string[];
  exactNiveau?: string;
} {
  const getFieldName = (base: string) =>
    isSecondMandate && base !== "niveau_scolaire_eleve" ? `${base}_2e` : base;

  const niveau = formData[getFieldName("niveau_scolaire_eleve")];
  const anneeSecondaire = formData[getFieldName("annee_secondaire")];

  let niveauExact = niveau;
  let fieldKey = "";

  if (niveau === "École aux adultes") {
    if (!anneeSecondaire)
      throw new Error("annee_secondaire is required for École aux adultes");
    niveauExact = anneeSecondaire;
  }

  switch (niveauExact) {
    case "Maternelle":
    case "1re année primaire":
    case "2e année primaire":
    case "3e année primaire":
    case "4e année primaire":
    case "5e année primaire":
    case "6e année primaire":
      fieldKey = getFieldName("subjectElementary");
      break;

    case "Secondaire1":
    case "Secondaire 1":
      fieldKey = getFieldName("subjectSec1");
      break;

    case "Secondaire2":
    case "Secondaire 2":
      fieldKey = getFieldName("subjectSec2");
      break;

    case "Secondaire3":
    case "Secondaire 3":
      fieldKey = getFieldName("subjectSec3");
      break;

    case "Secondaire4":
    case "Secondaire 4":
      fieldKey = getFieldName("subjectSec4");
      break;

    case "Secondaire5":
    case "Secondaire 5":
      fieldKey = getFieldName("subjectSec5");
      break;

    case "Cégep":
      fieldKey = getFieldName("subjectCegep");
      break;

    case "Université":
      fieldKey = getFieldName("subjectUni");
      break;

    default:
      throw new Error(`Unknown niveau: ${niveauExact}`);
  }

  const rawSubjects = formData[fieldKey] || [];
  let subjects: string[] = [];

  try {
    subjects = Array.isArray(rawSubjects)
      ? rawSubjects
      : typeof rawSubjects === "string"
      ? JSON.parse(rawSubjects)
      : [];
  } catch (e) {
    subjects = [];
  }
  console.log("Subjects from formatSubjects.ts : ", subjects);
  return { subjects, exactNiveau: niveauExact };
}
