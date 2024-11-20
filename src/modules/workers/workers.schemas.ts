import { Worker } from "@prisma/client";
import { z } from "zod";

export const enum WorkerStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  CLOSED = 2,
}

export const createWorkerSchema = z.object({
  name: z.string(),
});

export type CreateWorker = z.infer<typeof createWorkerSchema>;

export type WorkerDTO = Omit<Worker, "shard">;
