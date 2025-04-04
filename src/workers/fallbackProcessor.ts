import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { checkAndFallbackToOnline } from "../services/tutorat/fallbackHandler";

export const fallbackWorker = new Worker(
  "fallback-jobs",
  async (job) => {
    const data = job.data as {
      jobId: number;
      clientId: number;
      studentId: number;
      branchId: number;
      formData: Record<string, any>;
    };
    await checkAndFallbackToOnline(data);
  },
  {
    connection: redisConnection,
  }
);
