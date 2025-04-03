const qualLevels: Record<string, number> = {
  Primaire: 111235,
  Secondaire: 111236,
  Cégep: 111237,
  Université: 111238,
};

const subjectsMap: Record<string, number> = {
  Français: 33161,
  Anglais: 33160,
  Géographie: 33158,
  "Histoire - Primaire à secondaire 4": 33154,
  "Philosophie - Philosophie et rationalité": 33153,
  "Mathématiques - Primaire et Secondaire 1 à 3": 33152,
  "Mathématiques SN (Fort) - Secondaire 4 et 5": 33151,
  "Mathématiques TS (Moyen) - Secondaire 4 et 5": 33150,
  "Mathématiques CST (Faible) - Secondaire 4 et 5": 33149,
  "Mathématiques - Calcul différentiel": 33148,
  "Mathématiques - Calcul intégral": 33147,
  "Mathématiques - Algèbre linéaire et géométrie vectorielle": 33146,
  "Chimie - Secondaire 5": 33145,
  "Chimie - Chimie organique": 33144,
  "Chimie - Chimie des solutions": 33143,
  "Chimie - Chimie générale, la matière": 33142,
  "Physique - Secondaire 5": 33141,
  "Physique - Ondes et physique moderne": 33140,
  "Physique - Électricité et magnétisme": 33139,
  "Physique - Physique électronique": 33138,
  "Mathématiques - Méthodes quantitatives en sciences humaines": 68848,
  "Sciences (STE/SE) - Secondaire 4 (Enrichi)": 68858,
  "Sciences - Primaire à secondaire 2": 68863,
  "Biologie - Évolution et diversité du vivant": 68849,
  Espagnol: 68860,
  "Biologie - Structure et fonctionnement du vivant": 68850,
  "Biologie - Biologie humaine": 68852,
  "Biologie - Intégration en biologie humaine": 68851,
  "Philosophie - L’être humain": 68853,
  "Philosophie - Éthique et politique": 68854,
  "Histoire - Initiation à la civilisation occidentale": 68855,
  "Histoire - Histoire du monde depuis le XVe siècle": 68856,
  "Sciences (ST/ATS) - Secondaire 3-4": 68857,
  "Physique - Mécanique": 57367,
  "Mathématiques - Méthodes quantitatives avancées": 58074,
};

export function getFormattedTeachingSkills(
  rawSubjects: string,
  niveauExact: string
): {
  qual_level: number;
  subjects: { teachingSkill: string; subject: number | null }[];
} {
  const subjectArray = rawSubjects.split(",").map((s) => s.trim());
  const niveauLower = niveauExact.toLowerCase();

  // Déterminer le niveau général
  let niveau = "";
  if (niveauLower.includes("primaire") || niveauLower.includes("maternelle")) {
    niveau = "Primaire";
  } else if (niveauLower.includes("secondaire")) {
    niveau = "Secondaire";
  } else if (niveauLower.includes("cégep")) {
    niveau = "Cégep";
  } else if (niveauLower.includes("université")) {
    niveau = "Université";
  }

  const qual_level = qualLevels[niveau];
  if (!qual_level) throw new Error("Niveau scolaire non reconnu.");

  const result: { teachingSkill: string; subject: number | null }[] = [];

  subjectArray.forEach((subject) => {
    let skillValue = "";

    if (
      niveauExact.includes("primaire") ||
      niveauExact === "Secondaire 1" ||
      niveauExact === "Secondaire 2" ||
      niveauExact === "Secondaire 3"
    ) {
      if (subject === "Français") skillValue = "Français";
      else if (subject === "Anglais") skillValue = "Anglais";
      else if (subject === "Espagnol") skillValue = "Espagnol";
      else if (subject === "Mathématiques")
        skillValue = "Mathématiques - Primaire et Secondaire 1 à 3";
      else if (subject === "Sciences (ST/ATS)")
        skillValue = "Sciences (ST/ATS) - Secondaire 3-4";
      else if (subject === "Sciences")
        skillValue = "Sciences - Primaire à secondaire 2";
      else if (subject === "Géographie") skillValue = "Géographie";
      else if (subject === "Histoire")
        skillValue = "Histoire - Primaire à secondaire 4";
    } else if (
      niveauExact === "Secondaire 4" ||
      niveauExact === "Secondaire 5"
    ) {
      if (subject === "Français") skillValue = "Français";
      else if (subject === "Anglais") skillValue = "Anglais";
      else if (subject === "Espagnol") skillValue = "Espagnol";
      else if (subject === "Mathématiques Régulier (CST)")
        skillValue = "Mathématiques CST (Faible) - Secondaire 4 et 5";
      else if (subject === "Mathématiques Moyen (TS)")
        skillValue = "Mathématiques TS (Moyen) - Secondaire 4 et 5";
      else if (subject === "Mathématiques Enrichi (SN)")
        skillValue = "Mathématiques SN (Fort) - Secondaire 4 et 5";
      else if (subject === "Sciences (ST/ATS)")
        skillValue = "Sciences (ST/ATS) - Secondaire 3-4";
      else if (subject === "Sciences (STE/SE)")
        skillValue = "Sciences (STE/SE) - Secondaire 4 (Enrichi)";
      else if (subject === "Physique") skillValue = "Physique - Secondaire 5";
      else if (subject === "Chimie") skillValue = "Chimie - Secondaire 5";
      else if (subject === "Géographie") skillValue = "Géographie";
      else if (subject === "Histoire du monde depuis le XVe siècle")
        skillValue = "Histoire - Histoire du monde depuis le XVe siècle";
      else if (
        subject === "Initiation à l’histoire de la civilisation occidentale"
      )
        skillValue = "Histoire - Initiation à la civilisation occidentale";
      else if (subject === "Histoire")
        skillValue = "Histoire - Primaire à secondaire 4";
    } else if (niveau === "Cégep" || niveau === "Université") {
      if (subject === "Français") skillValue = "Français";
      else if (subject === "Anglais") skillValue = "Anglais";
      else if (subject === "Calcul différentiel")
        skillValue = "Mathématiques - Calcul différentiel";
      else if (subject === "Calcul intégral")
        skillValue = "Mathématiques - Calcul intégral";
      else if (subject === "Algèbre linéaire et géométrie vectorielle")
        skillValue =
          "Mathématiques - Algèbre linéaire et géométrie vectorielle";
      else if (subject === "Méthodes quantitatives en sciences humaines")
        skillValue =
          "Mathématiques - Méthodes quantitatives en sciences humaines";
      else if (subject === "Méthodes quantitatives avancées")
        skillValue =
          "Mathématiques - Méthodes quantitatives en sciences humaines";
      else if (subject === "Électricité et magnétisme")
        skillValue = "Physique - Électricité et magnétisme";
      else if (subject === "Physique mécanique")
        skillValue = "Physique - Mécanique";
      else if (subject === "Ondes et physique moderne")
        skillValue = "Physique - Ondes et physique moderne";
      else if (subject === "Physique électronique")
        skillValue = "Physique - Physique électronique";
      else if (subject === "Chimie des solutions")
        skillValue = "Chimie - Chimie des solutions";
      else if (subject === "Chimie générale, la matière")
        skillValue = "Chimie - Chimie générale, la matière";
      else if (subject === "Chimie organique")
        skillValue = "Chimie - Chimie organique";
      else if (subject === "Biologie humaine")
        skillValue = "Biologie - Biologie humaine";
      else if (subject === "Évolution et diversité du vivant")
        skillValue = "Biologie - Évolution et diversité du vivant";
      else if (subject === "Intégration en biologie humaine")
        skillValue = "Biologie - Intégration en biologie humaine";
      else if (subject === "Structure et fonctionnement du vivant")
        skillValue = "Biologie - Structure et fonctionnement du vivant";
      else if (subject === "Éthique et politique")
        skillValue = "Philosophie - Éthique et politique";
      else if (subject === "L’être humain")
        skillValue = "Philosophie - L’être humain";
      else if (subject === "Philosophie et rationalité")
        skillValue = "Philosophie - Philosophie et rationalité";
    }

    if (skillValue) {
      const subjectId = subjectsMap[skillValue] ?? null;
      result.push({ teachingSkill: skillValue, subject: subjectId });
    }
  });

  console.log(
    "From mapTeachingSkillsToAPI.ts : - qual level : " +
      qual_level +
      " - subjects : " +
      result
  );
  return {
    qual_level,
    subjects: result,
  };
}
