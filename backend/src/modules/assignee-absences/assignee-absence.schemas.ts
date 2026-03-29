import { z } from "zod";

const trimmedRequiredString = z
  .string()
  .trim()
  .min(1, "Responsible name is required.")
  .max(150, "Responsible name must be at most 150 characters.");

export const setAssigneeAbsenceSchema = z.object({
  responsibleName: trimmedRequiredString,
  isAbsent: z.boolean()
});

export type SetAssigneeAbsenceInput = z.infer<typeof setAssigneeAbsenceSchema>;
