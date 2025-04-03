import { getFormattedDateTimeCanada } from "../common/date.utils";
import { formatDisponibilitesFromForm } from "../common/formatAvailability";
import { formatLearningDifficulties } from "./formatLearningDifficulties";
import { correctNoteWithAI } from "../common/correctText";

interface GenerateJobInfoInput {
  formData: Record<string, any>;
  subjects: string[];
  niveauExact: string;
  location: "enLigne" | "enPresentiel";
  clientVille?: string;
  clientAdresse?: string;
  studentId: number;
}

export async function generateJobInfo({
  formData,
  subjects,
  niveauExact,
  location,
  clientVille,
  clientAdresse,
  studentId,
}: GenerateJobInfoInput) {
  const lieu = formData.lieu_seances;
  const etablissement = formData.Nom_etablissement || "Nom de l’établissement";
  const acceptation = formData.accepte || "";
  const city1 = formData?.address_3?.city;
  const city2 = formData?.address_4?.city;
  const adresse1 = formData?.address_3?.address_line_1;
  const adresse2 = formData?.address_4?.address_line_1;
  const adresseEtablissement =
    formData?.Adresse_de_letablissement_Tutorat?.address_line_1;
  const villeEtablissement = formData?.Adresse_de_letablissement_Tutorat?.city;

  const normalizeVille = (v: string) =>
    v
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const formattedSubjects = subjects.join(", ").replace(/, ([^,]*)$/, " et $1");
  const seanceEnPresentiel = location !== "enLigne";

  // ----------------------------------- Titre du mandat ---------------------------------
  let title = "";
  if (location === "enLigne") {
    title = `En ligne : ${formattedSubjects} de ${niveauExact}`;
  } else if (lieu === "Mon domicile") {
    title = `${clientVille} (À domicile) : ${formattedSubjects} de ${niveauExact}`;
  } else if (lieu === "Bibliothèque" || lieu === "École") {
    title = `${
      lieu === "Bibliothèque" ? "À la bibliothèque" : "À l’école"
    } (${etablissement}) : ${formattedSubjects} de ${niveauExact}`;
  } else if (lieu === "Deux adresses différentes") {
    title =
      normalizeVille(city1) === normalizeVille(city2)
        ? `${city1} (À domicile) : ${formattedSubjects} de ${niveauExact}`
        : `${city1} et ${city2} (À domicile) : ${formattedSubjects} de ${niveauExact}`;
  }

  // -------------------------------- Description ------------------------------------
  let description = "Lieu : ";
  if (location === "enLigne") {
    description += "En ligne";
  } else if (lieu === "Mon domicile" && clientVille) {
    description += `Au domicile de l’élève\nAdresse à proximité du lieu : ${clientVille} (près de ${clientAdresse})`;
  } else if (lieu === "Bibliothèque" || lieu === "École") {
    description += `${
      lieu === "Bibliothèque" ? "À la bibliothèque" : "À l’école"
    }\nAdresse à proximité : ${villeEtablissement} (près de ${adresseEtablissement})`;
  } else if (lieu === "Deux adresses différentes") {
    description +=
      normalizeVille(city1) === normalizeVille(city2)
        ? `À deux adresses différentes\nAdresse à proximité : \n- ${city1} (${adresse1})\n- ${city1} (${adresse2})\n`
        : `À deux adresses différentes\nAdresse à proximité de : \n- ${city1} (${adresse1})\n- ${city2} (${adresse2})\n`;
    description += `\nTemps de trajet entre les deux adresses : ${formData.temps_trajet}`;
  }

  description += `\nMatière(s) : ${formattedSubjects}`;
  description += `\nNiveau scolaire : ${niveauExact}`;
  description += `\nLangue d'enseignement : ${
    formData.Langue_enseignement || "Français"
  }`;
  description += `\nDifficulté(s) d’apprentissage : ${formatLearningDifficulties(
    formData.Difficultes__dapprentissages_list,
    formData.probleme_dapprentissage,
    formData.autre_defis_tutorat
  )}`;
  description += `\nDébut des séances souhaité : ${
    formData.debut_seances === "À une date précise"
      ? formData.datetime_debut_seance
      : formData.debut_seances
  }`;
  description += `\nFréquence des séances : ${formData.frequence_seances}`;
  description += `\nDisponibilités : \n${formatDisponibilitesFromForm(
    formData
  )}`;

  const { correctedNote } = await correctNoteWithAI(formData);
  if (correctedNote) {
    description += `\n\nNote(s) laissée(s) par le parent : ${correctedNote}`;
  }

  // --------------------------- Notes de gestion --------------------------------
  let notes = `**Inscription assistée** réalisée le ${getFormattedDateTimeCanada(
    "fr"
  )}. Préférence du client - Genre du tuteur : ${
    formData.genre_tuteur || "Non spécifié"
  }`;
  if (seanceEnPresentiel) {
    notes += `\nLe client ${
      acceptation?.includes("accepte") ? "**ACCEPTE**" : "**REFUSE**"
    } que l’on **modifie sa demande à en ligne** si nous n’avons pas trouvé de tuteur après 7 jours.`;
  }
  if (formData.tutor_requirements === "true") {
    let exigencesArray: string[] = [];

    try {
      exigencesArray = JSON.parse(formData.exigences_tuteur || "[]");
    } catch (error) {
      console.warn("exigences_tuteur n'est pas un tableau JSON valide.");
    }

    notes += `\nExigence du client pour le tuteur : ${exigencesArray.join(
      ", "
    )}\n`;
  }

  // --------------------------- Extra attrs -------------------------------------
  const extra_attrs = {
    note: notes,
    coordonnees_job: formData.information_tuteur || "",
    location: location === "enLigne" ? "en-ligne" : "a-domicile",
    origine: "inscription-assistee",
    switch_to_online_after_7_days: seanceEnPresentiel ? "true" : "false",
    tutor_requirements: formData.tutor_requirements || "false",
  };

  const jobPayload = {
    name: title,
    dft_charge_rate: formData?.rates?.chargeRate || 0,
    dft_contractor_rate: formData?.rates?.tutorRate || 0,
    colour: "#DB7093",
    status: "available",
    description,
    rcrs: [{ recipient: studentId }],
    extra_attrs,
  };

  return jobPayload;
}
