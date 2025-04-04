import { createJob, assignskillToService } from "../serviceService";
import { getFormattedTeachingSkills } from "../../utils/tutorat/mapTeachingSkillsToAPI";
import { sendJobToAutomations } from "../../utils/common/sendAutomationRequest";

export async function processJob({
  branchId,
  jobPayload,
  studentId,
  clientId,
  subjects,
  exactNiveau,
}: {
  branchId: number;
  jobPayload: any;
  studentId: number;
  clientId: number;
  subjects: string[];
  exactNiveau: string;
}) {
  const createdJob = await createJob(branchId, jobPayload);
  // await sendJobToAutomations(createdJob, studentId, clientId);

  const teachingSkills = getFormattedTeachingSkills(
    subjects.join(", "),
    exactNiveau
  );
  const validSkills = teachingSkills.subjects.filter((s) => s.subject !== null);

  await Promise.all(
    validSkills.map((skill) =>
      assignskillToService(branchId, {
        service: createdJob.id,
        priority: "required",
        qual_level: teachingSkills.qual_level,
        subject_category: 60,
        subject: skill.subject,
      })
    )
  );

  return createdJob;
}
