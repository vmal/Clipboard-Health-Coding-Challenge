import { Workplace } from "@prisma/client";
import { z } from "zod";

import { MAX_SHARDS } from "../shared/constants";

export const enum WorkplaceStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  CLOSED = 2,
}

export const createWorkplaceSchema = z.object({
  name: z.string(),
  shard: z.number().int().min(0).max(MAX_SHARDS).optional(),
});

export type CreateWorkplace = z.infer<typeof createWorkplaceSchema>;

export type WorkplaceDTO = Omit<Workplace, "shard">;
