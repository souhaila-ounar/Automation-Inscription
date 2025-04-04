import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const fallbackQueue = new Queue("fallback-jobs", {
  connection: redisConnection,
});
