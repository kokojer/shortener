import { z } from "zod";

export const InputShortenSchema = z.object({
  originalUrl: z.string().url(),
  expiresAt: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .optional(),
  alias: z.string().max(20).optional(),
});

export type InputShortenType = z.infer<typeof InputShortenSchema>;
