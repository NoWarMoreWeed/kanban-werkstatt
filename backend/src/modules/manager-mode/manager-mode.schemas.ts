import { z } from "zod";

export const activateManagerModeSchema = z.object({
  password: z.string().trim().min(1, "Password is required.")
});

export type ActivateManagerModeInput = z.infer<typeof activateManagerModeSchema>;
