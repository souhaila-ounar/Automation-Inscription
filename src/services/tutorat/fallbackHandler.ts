export async function checkAndFallbackToOnline(
  jobId: number,
  studentId: number,
  clientId: number
) {
  // 1. Récupère le job via l'API TC
  // 2. Vérifie s’il est toujours “available” ET location = “a-domicile”
  // 3. Si oui, crée un nouveau job version “enLigne” avec les bons tarifs, note, etc.
  // 4. Mets l’ancien job en “finished”
  // 5. Envoie email au client
}
