import axios from "axios";
import {
  jumelageEndpoint,
  creditCardEndpoint,
  addLabelInHomeEndpoint,
} from "../../config";
export async function sendAutomationRequest(
  endpoint: string,
  data: any
): Promise<any> {
  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de l'envoi de la requete : ",
      error.response?.data || error.message
    );
    throw new Error("Echec de l'envoi de la requete d'automatisation");
  }
}

export async function sendJobToAutomations(jobData: any) {
  const jobId = jobData.id;
  const jobStatus = jobData.status;
  const branch = jobData.branch;
  const jobName = jobData.name;
  const chargeRate = parseFloat(jobData.dft_charge_rate);
  const tutorRate = parseFloat(jobData.dft_contractor_rate);
  const rcrs = JSON.parse(jobData.rcrs || "[]");
  const studentId = rcrs[0]?.recipient;
  const clientId = rcrs[0]?.paying_client;

  const extraAttrs = JSON.parse(jobData.extra_attrs || "[]");
  const locationValue =
    extraAttrs
      .find((attr: any) => attr.machine_name === "location")
      ?.value?.trim() || "";

  const jumelageData = {
    events: [
      {
        action: "CREATED_SERVICE_FROM_API",
        verb: "Created a job from api",
        subject: {
          id: jobId,
          status: jobStatus,
        },
        branch: branch.toString(),
      },
    ],
  };

  const creditCardData = {
    events: [
      {
        timestamp: "bull",
        action: "CREATED_A_SERVICE",
        verb: "Created a Job",
        branch: parseInt(branch),
        subject: {
          id: jobId,
          name: jobName,
          branch: parseInt(branch),
          dft_charge_rate: chargeRate,
          dft_contractor_rate: tutorRate,
          location: locationValue,
          rcrs: [
            {
              recipient: studentId,
              paying_client: clientId,
            },
          ],
          status: jobStatus,
        },
      },
    ],
  };

  await sendAutomationRequest(jumelageEndpoint, jumelageData);
  await sendAutomationRequest(creditCardEndpoint, creditCardData);

  if (locationValue.toLowerCase().includes("domicile")) {
    const inHomeData = {
      events: [
        {
          action: "CHANGED_SERVICE_STATUS",
          verb: "Changed a Job's status",
          subject: {
            id: jobId,
            status: jobStatus,
          },
          branch: branch.toString(),
        },
      ],
    };
    await sendAutomationRequest(addLabelInHomeEndpoint, inHomeData);
  }
}
