import { TutorCruncherClient } from "../clients/client";
import { ResourceType } from "../enums/tc-resource-type.enums";

//----------- client -----------------
export async function createClient(branchId: number, clientData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.createResource(ResourceType.CLIENTS, clientData);
}

export async function getClient(branchId: number, clientId: string) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.getResourceById(ResourceType.CLIENTS, clientId);
}

export async function updateClient(branchId: number, clientData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.updateResource(ResourceType.CLIENTS, clientData);
}
//-------------- student ---------------

export async function createStudent(branchId: number, studentData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.createResource(ResourceType.RECIPIENTS, studentData);
}

export async function getStudent(branchId: number, studentID: string) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.getResourceById(ResourceType.RECIPIENTS, studentID);
}
