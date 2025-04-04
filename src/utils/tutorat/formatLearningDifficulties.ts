export function formatLearningDifficulties(
  difficultiesRaw: string | undefined,
  hasLearningProblem: boolean,
  otherChallengesText: string = ""
): string {
  if (!hasLearningProblem) return "Aucune";

  let parsedInput: string[] = [];

  try {
    parsedInput = difficultiesRaw ? JSON.parse(difficultiesRaw) : [];
  } catch (error) {
    console.warn("Échec du parsing des difficultés :", difficultiesRaw);
    parsedInput = [];
  }

  let difficulties: string[] = [];

  if (parsedInput.includes("Autre(s)")) {
    difficulties = parsedInput.filter((d) => d !== "Autre(s)");
    difficulties.push(otherChallengesText || "(non précisé)");
  } else {
    difficulties = parsedInput;
  }

  return difficulties.join(", ");
}
