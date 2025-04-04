import { findStudentIdFromClientRecipients } from "../../utils/common/getStudentIdFromClient";
import { getFormattedDateTimeCanada } from "../../utils/common/date.utils";
import {
  createClient,
  updateClient,
  createStudent,
  getClient,
} from "../clientStudentService";
import { FormatGenderAndSchool } from "../../utils/common/handleGenderAndSchool";
import { getNoteFieldName } from "../../utils/common/noteFieldName";

export async function processClientAndStudent(
  formData: Record<string, any>,
  branchId: number
): Promise<{
  clientId: number;
  studentId: number;
  clientCity: string;
  clientAdresse: string;
}> {
  const { client_id, recipient_hidden } = formData;
  const parentName = formData.nom_parent;
  const email = formData.user_email;
  const adresse = formData.address_client || {};
  let clientId = 0;
  let studentId = 0;
  let clientAdresse = "";
  let clientCity = "";

  const notes = [];
  if (formData.Ajouter_les_frais_d_inscription_) {
    notes.push(`[${getFormattedDateTimeCanada("fr")}]
    Frais d'inscription générés et ajoutés au compte.`);
  }

  if (formData.notes_de_gestion_client) {
    notes.push(formData.notes_de_gestion_client.trim());
  }

  const langueRaw = formData.langue_client?.toLowerCase() || "";
  const langue = langueRaw.includes("fr") ? "francais" : "anglais";

  const newNote = notes.join("\n");

  if (!client_id) {
    const clientExtraAttrs = {
      notes: newNote,
      langue_de_communication: langue,
      signup_origin: "assisted-enrollment",
      organisation_school: "false",
      credit_card_info: "false",
      credit_card_count: "0",
    };

    const clientPayload: any = {
      first_name: parentName?.first_name,
      last_name: parentName?.last_name,
      email,
      status: "live",
      extra_attrs: clientExtraAttrs,
      send_emails: true,
    };

    if (!formData.contact_address) {
      Object.assign(clientPayload, {
        street: adresse.address_line_1,
        town: adresse.city,
        postcode: adresse.zip,
      });
    }

    const createdClient = await createClient(branchId, clientPayload);
    clientId = createdClient?.role?.id;
    clientAdresse = createdClient?.role?.user?.street;
    clientCity = createdClient?.role?.user?.town;
  } else {
    const existingClient = await getClient(branchId, client_id);
    const noteField = getNoteFieldName(formData.branch);

    const oldNote =
      existingClient?.extra_attrs
        ?.find((attr: any) => attr.machine_name === noteField)
        ?.value?.trim() || "";

    console.log(oldNote);
    const combinedNote = [newNote, oldNote].filter(Boolean).join("\n\n");
    console.log("combinedNote", combinedNote);
    const updatedExtraAttrs = {
      [noteField]: combinedNote,
      langue_de_communication: langue,
    };

    const clientPayload: any = {
      first_name: parentName?.first_name,
      last_name: parentName?.last_name,
      email,
      status: "live",
      extra_attrs: updatedExtraAttrs,
      send_emails: true,
    };

    if (!formData.contact_address) {
      Object.assign(clientPayload, {
        street: adresse.address_line_1,
        town: adresse.city,
        postcode: adresse.zip,
      });
    }

    clientId = parseInt(client_id);
    const updatedClient = await updateClient(branchId, {
      ...clientPayload,
      id: clientId,
    });
    clientAdresse = updatedClient?.role?.user?.street;
    clientCity = updatedClient?.role?.user?.town;
  }

  // ---------- STUDENT --------------
  const rawStudentAttrs = FormatGenderAndSchool({
    branch: formData.branch,
    genre: formData.genre_eleve,
    nomEcolePS: formData.nom_ecole_eleve,
    nomEcoleCegep: formData.nom_ecole_cegep,
    nomEcoleUni: formData.nom_ecole_uni,
    autreEcole: formData.autre_ecole,
  });

  const studentExtra_attrs = rawStudentAttrs;

  const isNewStudent =
    !recipient_hidden || recipient_hidden.toLowerCase() === "new_student";

  if (isNewStudent) {
    if (!clientId) {
      throw new Error("client id not found ! ");
    }
    const studentPayload: any = {
      first_name: formData.fisrt_name,
      last_name: formData.last_name,
      paying_client: clientId,
      ...adresse,
      extra_attrs: studentExtra_attrs,
    };
    const createdStudent = await createStudent(branchId, studentPayload);
    studentId = createdStudent?.role?.id;
  } else {
    const studentMatchId = await findStudentIdFromClientRecipients(
      branchId,
      clientId.toString(),
      recipient_hidden
    );

    if (!studentMatchId) {
      throw new Error("Étudiant introuvable dans les recipients.");
    }

    studentId = studentMatchId;
  }

  return { clientId, studentId, clientCity, clientAdresse };
}
