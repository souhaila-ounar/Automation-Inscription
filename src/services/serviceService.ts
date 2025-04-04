import { TutorCruncherClient } from "../clients/client";
import { ResourceType } from "../enums/tc-resource-type.enums";

export async function createJob(branchId: number, jobData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.createResource(ResourceType.SERVICES, jobData);
}

export async function getJobInfo(branchId: number, jobID: string) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.getResourceById(ResourceType.SERVICES, jobID);
}

export async function updateJobInfo(
  branchId: number,
  jobData: any,
  jobID: string
) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.updateResource(ResourceType.SERVICES, jobData, jobID);
}
export async function assignskillToService(branchId: number, skillData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.createResource(ResourceType.TEACHINGSKILLS, skillData);
}
