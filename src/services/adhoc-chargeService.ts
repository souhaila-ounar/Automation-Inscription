import { TutorCruncherClient } from "../clients/client";
import { ResourceType } from "../enums/tc-resource-type.enums";

export async function createAdhocCharge(branchId: number, adhocData: any) {
  const tc = new TutorCruncherClient(branchId);
  return await tc.createResource(ResourceType.ADHOCCHARGES, adhocData);
}
