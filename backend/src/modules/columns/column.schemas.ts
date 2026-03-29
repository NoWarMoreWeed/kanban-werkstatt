import { z } from "zod";

const trimmedRequiredString = z
  .string()
  .trim()
  .min(1, "Column value is required.")
  .max(120, "Column value must be at most 120 characters.");

export const boardColumnsParamsSchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required.")
});

export const columnParamsSchema = z.object({
  columnId: z.string().trim().min(1, "Column id is required.")
});

export const createColumnSchema = z.object({
  title: trimmedRequiredString
});

export const updateColumnSchema = z.object({
  title: trimmedRequiredString
});

export const reorderColumnSchema = z.object({
  direction: z.enum(["up", "down"])
});

export const updateColumnActiveSchema = z.object({
  isActive: z.boolean()
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnInput = z.infer<typeof reorderColumnSchema>;
export type UpdateColumnActiveInput = z.infer<typeof updateColumnActiveSchema>;
