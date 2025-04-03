import { deepSeekKey, openAIKey } from "../../config";

interface CorrectNoteOutput {
  correctedNote: string | null;
  fieldName: string | null;
}

export async function correctNoteWithAI(
  formData: Record<string, any>
): Promise<CorrectNoteOutput> {
  const deepSeekAPI = "https://api.deepseek.com/chat/completions";
  const openAIAPI = "https://api.openai.com/v1/chat/completions";

  const deepSeekKEY = deepSeekKey;
  const openAIKEY = openAIKey;

  const possibleNoteFields = [
    "description_info_tuteur",
    "information_tuteur",
    "infos_tuteur",
    "commentaire_2e",
    "infos_supplementaires",
  ];

  const fieldName = possibleNoteFields.find(
    (key) => formData[key] && typeof formData[key] === "string"
  );

  if (!fieldName) return { correctedNote: null, fieldName: null };

  const paragraph = formData[fieldName];

  try {
    const deepSeekRes = await fetch(deepSeekAPI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deepSeekKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Tu es un correcteur orthographique et grammatical. Retourne uniquement le texte corrigé, sans explication.",
          },
          {
            role: "user",
            content: `Corrige ce texte sans ajouter d'explication : ${paragraph}`,
          },
        ],
      }),
    });

    const deepSeekData = await deepSeekRes.json();
    const corrected =
      deepSeekData?.choices?.[0]?.message?.content?.trim() || null;
    if (corrected) return { correctedNote: corrected, fieldName };
  } catch (e) {
    console.warn("DeepSeek failed, trying OpenAI...");
  }

  try {
    const openAIRes = await fetch(openAIAPI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Tu es un correcteur orthographique et grammatical. Retourne uniquement le texte corrigé, sans explication.",
          },
          {
            role: "user",
            content: `Corrige ce texte sans ajouter d'explication : ${paragraph}`,
          },
        ],
      }),
    });

    const openAIData = await openAIRes.json();
    const corrected =
      openAIData?.choices?.[0]?.message?.content?.trim() || null;
    return { correctedNote: corrected ?? paragraph, fieldName };
  } catch (e) {
    console.error("Correction failed with both services.");
    return { correctedNote: paragraph, fieldName };
  }
}
