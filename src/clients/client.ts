import axios from "axios";
import { BranchUtils } from "../utils/branch.utils";
import { ResourceType } from "../enums/tc-resource-type.enums";
import { URL_BASE_TC } from "../config";

export class TutorCruncherClient {
  private baseUrl: string;
  private token: string | null;

  constructor(branchId: string | number) {
    this.baseUrl = URL_BASE_TC;
    this.token = BranchUtils.getBranchToken(branchId);
    if (!this.token) {
      throw new Error(`No token found for branch ID: ${branchId}`);
    }
  }

  async apiRequest(
    endpoint: string,
    method: string = "GET",
    body: any = null,
    params: any = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const config = {
        method,
        url,
        headers: {
          Authorization: `token ${this.token}`,
          "Content-Type": "application/json",
        },
        params,
        data: body ? body : undefined,
      };

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error(`TutorCruncher API Error: ${error.message}`, error);
      throw error;
    }
  }

  async getResourceById(resourceType: ResourceType, id: string): Promise<any> {
    return this.apiRequest(`/${resourceType}/${id}`, "GET");
  }

  async getAllResources(
    resourceType: ResourceType,
    params: any = {}
  ): Promise<any> {
    return this.apiRequest(`/${resourceType}/`, "GET", null, params);
  }

  async createResource(resourceType: ResourceType, data: any): Promise<any> {
    return this.apiRequest(`/${resourceType}/`, "POST", data);
  }

  async updateResource(
    resourceType: ResourceType,
    data: any,
    id?: string
  ): Promise<any> {
    const usePostForUpdate = [
      ResourceType.CLIENTS,
      ResourceType.CONTRACTORS,
      ResourceType.RECIPIENTS,
    ];
    const method = usePostForUpdate.includes(resourceType) ? "POST" : "PUT";

    const endpoint =
      method === "POST" ? `/${resourceType}/` : `/${resourceType}/${id}`;

    return this.apiRequest(endpoint, method, data);
  }

  async deleteResource(resourceType: ResourceType, id: string): Promise<any> {
    return this.apiRequest(`/${resourceType}/${id}`, "DELETE");
  }
}
