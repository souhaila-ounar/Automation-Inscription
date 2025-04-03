import { getClient } from "../../services/clientStudentService";

export async function findStudentIdFromClientRecipients(
  branchId: number,
  clientId: string,
  recipientHidden: string
): Promise<number | null> {
  try {
    const client = await getClient(branchId, clientId);

    const recipients = client?.paid_recipients || [];

    const match = recipients.find((r: any) => {
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase().trim();
      return fullName === recipientHidden.toLowerCase().trim();
    });

    return match ? match.id : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du student ID :", error);
    return null;
  }
}
