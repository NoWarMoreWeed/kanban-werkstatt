import { z } from "zod";

const trimmedRequiredString = z
  .string()
  .trim()
  .min(1, "Must not be empty.")
  .max(150, "Must be at most 150 characters.");

const trimmedOptionalString = z
  .string()
  .trim()
  .max(150, "Must be at most 150 characters.")
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const partNumberSuggestionParamsSchema = z.object({
  suggestionId: z.string().trim().min(1, "Suggestion id is required.")
});

export const partNumberSuggestionQuerySchema = z.object({
  query: z.string().trim().max(150, "Query must be at most 150 characters.").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export const createPartNumberSuggestionSchema = z.object({
  partNumber: trimmedRequiredString,
  deviceName: trimmedOptionalString
});

export const updatePartNumberSuggestionSchema = createPartNumberSuggestionSchema;

export type PartNumberSuggestionQuery = z.infer<typeof partNumberSuggestionQuerySchema>;
export type CreatePartNumberSuggestionInput = z.infer<typeof createPartNumberSuggestionSchema>;
export type UpdatePartNumberSuggestionInput = z.infer<typeof updatePartNumberSuggestionSchema>;
