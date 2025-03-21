import { z } from "zod";

export const InputShortenSchema = z.object({
  originalUrl: z.string().url(),
  expiresAt: z.date().optional(),
  alias: z.string().max(20).optional(),
});

export type InputShortenType = z.infer<typeof InputShortenSchema>;
