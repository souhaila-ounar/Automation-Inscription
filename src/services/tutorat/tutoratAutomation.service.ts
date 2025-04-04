import { processClientAndStudent } from "./processClientAndStudent";
import { generateJobInfo } from "../../utils/tutorat/generateJobInfo";
import { getRatesFromFormData } from "../../utils/tutorat/getRates";
import { formatSubjects } from "../../utils/tutorat/formatSubjects";
import { processJob } from "./processJobs";
import { createAdhocChargeIfNeeded } from "./processAdhocCharge";
import { fallbackQueue } from "../../queues/fallbackQueue";

export async function runTutoratAutomation(
  formData: Record<string, any>,
  branchId: number
) {
  // ------------ Client and student ---------------
  const { clientId, studentId, clientAdresse, clientCity } =
    await processClientAndStudent(formData, branchId);

  //----------------- Adhoc charge -----------------
  await createAdhocChargeIfNeeded(formData, branchId, clientId);

  //-------------------- Job1 (obligatoire) ---------
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

  const createdJob1 = await processJob({
    branchId,
    jobPayload: job1Payload,
    studentId,
    clientId,
    subjects,
    exactNiveau: exactNiveau || "",
  });

  await fallbackQueue.add(
    "check-fallback",
    {
      jobId: createdJob1.id,
      studentId,
      clientId,
    },
    {
      delay: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
      attempts: 1,
    }
  );

  //-------------------- Job2 (facultatif) ------------
  if (formData.Cr_er_une_2e_demande) {
    const { subjects: s2, exactNiveau: n2 } = formatSubjects({
      formData,
      isSecondMandate: true,
    });

    const {
      location: loc2,
      chargeRate: cr2,
      tutorRate: tr2,
    } = getRatesFromFormData(formData);

    const job2Payload = await generateJobInfo({
      formData,
      subjects: s2,
      niveauExact: n2 || "",
      location: loc2,
      clientVille: clientCity,
      clientAdresse: clientAdresse,
      studentId,
    });

    job2Payload.dft_charge_rate = cr2;
    job2Payload.dft_contractor_rate = tr2;

    const createdJob2 = await processJob({
      branchId,
      jobPayload: job2Payload,
      studentId,
      clientId,
      subjects: s2,
      exactNiveau: n2 || "",
    });

    await fallbackQueue.add(
      "check-fallback",
      {
        jobId: createdJob2.id,
        studentId,
        clientId,
      },
      {
        delay: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
        attempts: 1,
      }
    );
  }
}
