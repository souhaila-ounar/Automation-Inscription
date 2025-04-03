interface ExtraFieldsInput {
  branch: string;
  genre?: string;
  nomEcolePS?: string;
  nomEcoleUni?: string;
  nomEcoleCegep?: string;
  autreEcole?: string;
}

export function FormatGenderAndSchool({
  branch,
  genre,
  nomEcolePS,
  nomEcoleUni,
  nomEcoleCegep,
  autreEcole,
}: ExtraFieldsInput): Record<string, string> {
  let extraFields: Record<string, string> = {};
  const nomEcole =
    autreEcole || nomEcolePS || nomEcoleUni || nomEcoleCegep || "";

  // school name
  if (branch.includes("Tutorat")) {
    extraFields["school_ecole"] = nomEcole;
  } else if (
    branch.includes("Orthopedagogie") ||
    branch.includes("Stimulation")
  ) {
    extraFields["ecole"] = nomEcole;
  } else if (branch.includes("Canada") || branch.includes("USA")) {
    extraFields["school"] = nomEcole;
  }

  // gender
  const g = genre?.toLowerCase();
  if (
    branch.includes("Tutorat") ||
    branch.includes("Orthopedagogie") ||
    branch.includes("Stimulation")
  ) {
    if (g === "garçon") extraFields["genre"] = "male";
    else if (g === "fille") extraFields["genre"] = "female";
    else extraFields["genre"] = "unspoken";
  } else if (branch.includes("Orthophonie")) {
    if (g === "garçon") extraFields["sr_gender"] = "male";
    else if (g === "fille") extraFields["sr_gender"] = "female";
    else extraFields["sr_gender"] = "unspoken";
  } else if (branch.includes("Canada") || branch.includes("USA")) {
    extraFields["gender"] = g === "male" || g === "female" ? g : "unspoken";
  }

  return extraFields;
}
