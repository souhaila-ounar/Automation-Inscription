import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { checkAndFallbackToOnline } from "../services/tutorat/fallbackHandler";

export const fallbackWorker = new Worker(
  "fallback-jobs",
  async (job) => {
    const { jobId, studentId, clientId } = job.data;
    await checkAndFallbackToOnline(jobId, studentId, clientId);
  },
  {
    connection: redisConnection,
  }
);
