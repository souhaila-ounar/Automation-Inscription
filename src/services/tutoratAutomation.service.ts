import { findStudentIdFromClientRecipients } from "../utils/common/getStudentIdFromClient";
import { getFormattedDateTimeCanada } from "../utils/common/date.utils";

import {
  createClient,
  updateClient,
  createStudent,
  getClient,
} from "./clientStudentService";
import { FormatGenderAndSchool } from "../utils/common/handleGenderAndSchool";
import { createAdhocChargeIfNeeded } from "./adhoc-chargeService";
import { generateJobInfo } from "../utils/tutorat/generateJobInfo";
import { createJob, assignskillToService } from "./serviceService";
import { getFormattedTeachingSkills } from "../utils/tutorat/mapTeachingSkillsToAPI";
import { formatSubjects } from "../utils/tutorat/formatSubjects";
import { getRatesFromFormData } from "../utils/tutorat/getRates";
import { sendJobToAutomations } from "../utils/common/sendAutomationRequest";

export async function createOrUpdateClientAndStudent(
  formData: Record<string, any>,
  branchId: number
): Promise<{ clientId: number; studentId: number }> {
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
    const updatedExtraAttrs: Record<string, string> = {};

    (existingClient?.role?.extra_attrs || []).forEach((attr: any) => {
      updatedExtraAttrs[attr.machine_name] = attr.value;
    });

    const oldNote = updatedExtraAttrs["notes"]?.trim() || "";
    const combinedNote = [newNote, oldNote].filter(Boolean).join("\n\n");

    updatedExtraAttrs["notes"] = combinedNote;
    updatedExtraAttrs["langue_de_communication"] = langue;
    updatedExtraAttrs["signup_origin"] = "assisted-enrollment";
    updatedExtraAttrs["organisation_school"] = "false";
    updatedExtraAttrs["credit_card_info"] = "false";
    updatedExtraAttrs["credit_card_count"] = "0";

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
    const updateClientfunction = await updateClient(branchId, {
      ...clientPayload,
      id: clientId,
    });
    clientAdresse = updateClientfunction?.role?.user?.street;
    clientCity = updateClientfunction?.role?.user?.town;
  }

  //------------ Adhoc charge -----------------
  await createAdhocChargeIfNeeded(formData, branchId, clientId);

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

  // ------------------- JOB 1 (Obligatoire) ---------------------
  const { subjects, exactNiveau } = formatSubjects({ formData });
  const { location, chargeRate, tutorRate } = getRatesFromFormData(formData);

  const job1Payload = await generateJobInfo({
    formData,
    subjects,
    niveauExact: exactNiveau || "",
    location,
    clientVille: clientCity,
    clientAdresse: clientAdresse,
    studentId,
  });

  job1Payload.dft_charge_rate = chargeRate;
  job1Payload.dft_contractor_rate = tutorRate;

  const createdJob1 = await createJob(branchId, job1Payload);
  sendJobToAutomations(createdJob1);
  console.log(createdJob1.id);

  // assigner teaching skills au Job 1
  const teachingSkills = getFormattedTeachingSkills(
    subjects.join(", "),
    exactNiveau || ""
  );
  console.log("teachingSkills : ", teachingSkills);
  const validSkills = teachingSkills.subjects.filter((s) => s.subject !== null);

  await Promise.all(
    validSkills.map((skill) =>
      assignskillToService(branchId, {
        service: createdJob1.id,
        priority: "required",
        qual_level: teachingSkills.qual_level,
        subject_category: 60,
        subject: skill.subject,
      })
    )
  );

  //-------------- Job 2 ---------------------
  if (formData.Cr_er_une_2e_demande) {
    const { subjects: subjects2, exactNiveau: exactNiveau2 } = formatSubjects({
      formData,
      isSecondMandate: true,
    });

    const {
      location: location2,
      chargeRate: chargeRate2,
      tutorRate: tutorRate2,
    } = getRatesFromFormData(formData);

    const job2Payload = await generateJobInfo({
      formData,
      subjects: subjects2,
      niveauExact: exactNiveau2 || "",
      location: location2,
      clientVille: clientCity,
      clientAdresse: clientAdresse,
      studentId,
    });

    job2Payload.dft_charge_rate = chargeRate2;
    job2Payload.dft_contractor_rate = tutorRate2;

    const createdJob2 = await createJob(branchId, job2Payload);
    sendJobToAutomations(createdJob2);
    const teachingSkills2 = getFormattedTeachingSkills(
      subjects2.join(", "),
      exactNiveau2 || ""
    );

    await Promise.all(
      teachingSkills2.subjects.map((skill) =>
        assignskillToService(branchId, {
          priority: "required",
          subject_category: 60,
          qual_level: teachingSkills2.qual_level,
          subject: skill.subject,
          service: createdJob2.id,
        })
      )
    );
  }

  return { clientId, studentId };
}
