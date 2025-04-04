import { Request, Response } from "express";
import { runTutoratAutomation } from "../services/tutorat/tutoratAutomation.service";

export const handleFormSubmission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const formData: Record<string, any> = req.body;
    const branchId = parseInt(formData?.branchID || "0");

    if (!branchId) {
      return res
        .status(400)
        .json({ error: "branchID is required and must be a valid number" });
    }

    await runTutoratAutomation(formData, branchId);
    console.log("Success!");
    return res.status(200).json({
      message: "Automatisation exécutée avec succès.",
    });
  } catch (error: any) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

/* ----------- test code --------------------
import { Request, Response } from "express";
import { getRatesFromFormData } from "../utils/tutorat/getRates";
import { formatSubjects } from "../utils/tutorat/formatSubjects";
import { formatLearningDifficulties } from "../utils/tutorat/formatLearningDifficulties";
import { correctNoteWithAI } from "../utils/common/correctText";
import { formatDisponibilitesFromForm } from "../utils/common/formatAvailability";
import { getFormattedTeachingSkills } from "../utils/tutorat/mapTeachingSkillsToAPI";
import { FormatGenderAndSchool } from "../utils/common/handleGenderAndSchool";
import { sendAutomationRequest } from "../utils/common/sendAutomationRequest";
export const handleFormSubmission = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const formData = req.body;
    //  Difficultés
    const difficultiesRaw = formData["Difficultes__dapprentissages_list"];
    const hasLearningProblem = formData["probleme_dapprentissage"] === "Oui";
    const otherChallenges = formData["autre_defis_tutorat"] || "";
    const difficultes = formatLearningDifficulties(
      difficultiesRaw,
      hasLearningProblem,
      otherChallenges
    );

    //  Rates
    const rates = getRatesFromFormData(formData);

    // const { correctedNote, fieldName } = await correctNoteWithAI(formData);

    const disponibilitesNote = formatDisponibilitesFromForm(formData);
    //  Réponse
    //  Subjects
    const subjectsData = formatSubjects({ formData });
    const secondSubjectsData = formatSubjects({
      formData,
      isSecondMandate: true,
    });
    // Teaching Skills → ID pour API
    const parsedSubjects = JSON.parse(subjectsData.subjects[0]);
    const rawSubjects = parsedSubjects.join(",");
    const teachingSkills = getFormattedTeachingSkills(
      rawSubjects,
      subjectsData.exactNiveau || ""
    );

    // Gender & School

    const extrafieldsStudent = FormatGenderAndSchool({
      branch: formData.branch,
      genre: formData.genre_eleve,
      nomEcolePS: formData.nom_ecole_eleve,
      nomEcoleCegep: formData.nom_ecole_cegep,
      nomEcoleUni: formData.nom_ecole_uni,
      autreEcole: formData.autre_ecole,
    });

    return res.status(200).json({
      message: "Form handled correctly",
      difficultes,
      subjectsData,
      rates,
      disponibilitesNote,
      teachingSkills,
      // correctedNote,
      // fieldName,
      extrafieldsStudent,
      secondSubjectsData,
    });
  } catch (error) {
    console.error("Error in form handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
*/
