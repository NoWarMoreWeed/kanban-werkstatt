import { z } from "zod";

const trimmedRequiredString = z
  .string()
  .trim()
  .min(1, "Must not be empty.")
  .max(100, "Must be at most 100 characters.");

export const createBoardSchema = z.object({
  groupName: trimmedRequiredString,
  title: trimmedRequiredString
});

export const boardParamsSchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required.")
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

