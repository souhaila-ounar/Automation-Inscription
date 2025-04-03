export function formatLearningDifficulties(
  difficultiesRaw: string,
  hasLearningProblem: boolean,
  otherChallengesText: string = ""
): string {
  let parsedInput: string[] = [];

  try {
    parsedInput = difficultiesRaw ? JSON.parse(difficultiesRaw) : [];
  } catch (error) {
    console.warn("Difficulties parsing failed :", difficultiesRaw);
    parsedInput = [];
  }

  let difficulties: string[] = [];

  if (parsedInput.includes("Autre(s)")) {
    difficulties = parsedInput.filter((d) => d !== "Autre(s)");
    if (otherChallengesText) {
      difficulties.push(`${otherChallengesText}`);
    } else {
      difficulties.push("(non précisé)");
    }
  } else {
    difficulties = parsedInput;
  }

  return hasLearningProblem ? difficulties.join(", ") : "Aucune";
}
