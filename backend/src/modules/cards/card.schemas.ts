import { z } from "zod";

const trimmedRequiredString = z
  .string()
  .trim()
  .min(1, "Must not be empty.")
  .max(150, "Must be at most 150 characters.");

const cardPrioritySchema = z.enum(["1", "2", "3", "4"], {
  required_error: "Priority is required.",
  invalid_type_error: "Priority must be one of 1, 2, 3 or 4."
});

const dueDateSchema = z
  .coerce.date({
    required_error: "Due date is required.",
    invalid_type_error: "Due date must be a valid date."
  })
  .refine((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizedDate = new Date(value);
    normalizedDate.setHours(0, 0, 0, 0);

    return normalizedDate.getTime() >= today.getTime();
  }, "Due date must not be in the past.");

export const cardParamsSchema = z.object({
  cardId: z.string().trim().min(1, "Card id is required.")
});

export const boardCardsParamsSchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required.")
});

export const cardSearchQuerySchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required."),
  query: z.string().trim().min(1, "Search query is required.").max(150, "Must be at most 150 characters."),
  state: z.enum(["active", "archived", "uc", "all"]).default("active")
});

export const createCardSchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required."),
  columnId: z.string().trim().min(1, "Column id is required."),
  responsibleName: trimmedRequiredString,
  deviceName: trimmedRequiredString,
  priority: cardPrioritySchema,
  dueDate: dueDateSchema,
  partNumber: trimmedRequiredString,
  serialNumber: trimmedRequiredString,
  sapNumber: trimmedRequiredString,
  orderNumber: trimmedRequiredString
});

export const updateCardSchema = z.object({
  responsibleName: trimmedRequiredString,
  deviceName: trimmedRequiredString,
  priority: cardPrioritySchema,
  dueDate: dueDateSchema,
  partNumber: trimmedRequiredString,
  serialNumber: trimmedRequiredString,
  sapNumber: trimmedRequiredString,
  orderNumber: trimmedRequiredString
});

export const moveCardSchema = z.object({
  targetColumnId: z.string().trim().min(1, "Target column id is required.")
});

const bulkCardBaseSchema = z.object({
  boardId: z.string().trim().min(1, "Board id is required."),
  cardIds: z
    .array(z.string().trim().min(1, "Card id is required."))
    .min(1, "At least one card must be selected.")
    .max(100, "At most 100 cards can be changed at once.")
    .transform((cardIds) => Array.from(new Set(cardIds)))
});

export const bulkArchiveCardsSchema = bulkCardBaseSchema.extend({
  action: z.literal("archive")
});

export const bulkAssignCardsSchema = bulkCardBaseSchema.extend({
  action: z.literal("assign"),
  responsibleName: trimmedRequiredString
});

export const bulkMoveCardsSchema = bulkCardBaseSchema.extend({
  action: z.literal("move"),
  targetColumnId: z.string().trim().min(1, "Target column id is required.")
});

export const bulkMoveToUcCardsSchema = bulkCardBaseSchema.extend({
  action: z.literal("moveToUc")
});

export const bulkCardActionSchema = z.discriminatedUnion("action", [
  bulkArchiveCardsSchema,
  bulkAssignCardsSchema,
  bulkMoveCardsSchema,
  bulkMoveToUcCardsSchema
]);

export const createCommentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Author name is required.")
    .max(120, "Author name must be at most 120 characters."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(1000, "Message must be at most 1000 characters.")
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type BulkCardActionInput = z.infer<typeof bulkCardActionSchema>;
export type CardSearchQuery = z.infer<typeof cardSearchQuerySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
