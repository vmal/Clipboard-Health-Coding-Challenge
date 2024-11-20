import { Shift } from "@prisma/client";
import { z } from "zod";

import { MAX_SHARDS } from "../shared/constants";

export const createShiftSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  workerId: z.string().optional(),
  workplaceId: z.number(),
  shard: z.number().int().min(0).max(MAX_SHARDS).optional(),
});

export type CreateShift = z.infer<typeof createShiftSchema>;

export type ShiftDTO = Omit<Shift, "shard">;
