import { getRatesFromFormData } from "../../utils/tutorat/getRates";
import { generateJobInfo } from "../../utils/tutorat/generateJobInfo";
import { SMTPMailClient } from "../../clients/smtp-mail.client";
import { getFormattedDateTimeCanada } from "../../utils/common/date.utils";
import {
  getJobInfo,
  updateJobInfo,
  createJob,
  assignskillToService,
} from "../serviceService";
import { formatSubjects } from "../../utils/tutorat/formatSubjects";
import { sendJobToAutomations } from "../../utils/common/sendAutomationRequest";
import { getClient } from "../clientStudentService";
import { generateFallBackEmailContent } from "../../utils/common/emails/generateFallBackEmailContent";

export async function checkAndFallbackToOnline(data: {
  jobId: number;
  clientId: number;
  studentId: number;
  branchId: number;
  formData: Record<string, any>;
}) {
  const { jobId, branchId, studentId, clientId, formData } = data;

  const job = await getJobInfo(branchId, jobId.toString());

  const isAvailable = job.status === "available";
  const shouldSwitch =
    job.extra_attrs.find(
      (attr: any) => attr.machine_name === "switch_to_online_after_7_days"
    )?.value === "True";

  if (!isAvailable || !shouldSwitch) return;

  // ---------- 1. Fermer ancien mandat ----------
  const oldNote =
    job.extra_attrs.find((attr: any) => attr.machine_name === "note")?.value ||
    "";
  const dateFr = getFormattedDateTimeCanada("fr");
  const newNote = `Le ${dateFr}, ce mandat a été fermé automatiquement après 7 jours sans tuteur assigné. Le client ayant accepté de passer en ligne, une nouvelle demande a été créée.\n\n${oldNote}`;

  await updateJobInfo(
    branchId,
    {
      id: job.id,
      name: job.name,
      dft_charge_rate: job.dft_charge_rate,
      dft_contractor_rate: job.dft_contractor_rate,
      colour: "#ff0000",
      status: "finished",
      extra_attrs: {
        note: newNote,
      },
    },
    job.id
  );

  // ---------- 2. Créer le nouveau mandat en ligne ----------
  const updatedForm = { ...formData, location: "enLigne" };
  const { chargeRate, tutorRate } = getRatesFromFormData(updatedForm);

  const { subjects, exactNiveau } = formatSubjects({ formData: updatedForm });

  const jobPayload = await generateJobInfo({
    formData: updatedForm,
    subjects,
    niveauExact: exactNiveau || "",
    location: "enLigne",
    studentId,
  });

  jobPayload.dft_charge_rate = chargeRate;
  jobPayload.dft_contractor_rate = tutorRate;

  const newJob = await createJob(branchId, jobPayload);

  await sendJobToAutomations(newJob, studentId, clientId);

  // ---------- 3. Réassigner les teaching skills ----------
  for (const skill of job.desired_skills || []) {
    await assignskillToService(branchId, {
      service: newJob.id,
      subject: skill.subject.id,
      qual_level: skill.qual_level.id,
      priority: "required",
      subject_category: skill.subject_category.id,
    });
  }

  // ---------- 4.Envoi de courriel au client ----------
  const clientData = await getClient(branchId, clientId.toString());
  const admin = clientData?.associated_admin;

  const fromName = admin ? `${admin.first_name} ${admin.last_name}` : "Tutorax";
  const fromEmail = admin?.email || "contact@tutorax.com";
  const isFeminine = formData?.title?.toLowerCase() == "madame";
  const clientFirstName = formData.nom_parent.first_name;
  const body = generateFallBackEmailContent({
    subjects,
    isFeminine,
    adminName: fromName,
    clientFirstName,
  });
  const smtpClient = new SMTPMailClient();
  await smtpClient.sendEmail({
    fromName,
    fromEmail,
    toEmail: formData.user_email,
    subject: "Changement relatif à votre demande de tuteur",
    body,
  });
}
