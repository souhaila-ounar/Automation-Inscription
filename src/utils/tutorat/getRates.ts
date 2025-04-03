interface Rates {
  location: "enLigne" | "enPresentiel";
  chargeRate: number;
  tutorRate: number;
}

export function getRatesFromFormData(formData: Record<string, any>): Rates {
  const niveau = formData["niveau_scolaire_eleve"];
  const anneeSecondaire = formData["annee_secondaire"];
  const selectedLocation = formData["location"];

  let niveauExact = niveau;
  if (niveau === "École aux adultes" && anneeSecondaire) {
    niveauExact = anneeSecondaire;
  }

  const niveauxToujoursEnLigne = [
    "Secondaire 4",
    "Secondaire 5",
    "Cégep",
    "Université",
  ];

  const estToujoursEnLigne = niveauxToujoursEnLigne.includes(niveauExact);

  const location: "enLigne" | "enPresentiel" = estToujoursEnLigne
    ? "enLigne"
    : selectedLocation === "enPresentiel"
    ? "enPresentiel"
    : "enLigne";
  if (
    niveau === "Primaire" ||
    niveau === "Secondaire" ||
    niveau === "École aux adultes" ||
    niveauExact.startsWith("Secondaire") ||
    niveauExact === "Maternelle"
  ) {
    if (location === "enLigne") {
      return { location, chargeRate: 43, tutorRate: 18 };
    } else {
      return { location, chargeRate: 48, tutorRate: 18 };
    }
  } else if (niveauExact === "Cégep" || niveauExact === "Université") {
    return { location: "enLigne", chargeRate: 44, tutorRate: 22 };
  }

  return { location, chargeRate: 43, tutorRate: 18 };
}
