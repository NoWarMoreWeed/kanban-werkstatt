import { z } from "zod";

export const statisticsProblemExportQuerySchema = z.object({
  type: z.enum(["overdue", "unassigned", "stale", "uc"]),
  groupName: z.string().trim().max(120, "Group must be at most 120 characters.").optional(),
  boardId: z.string().trim().max(120, "Board id must be at most 120 characters.").optional(),
  assignee: z.string().trim().max(150, "Assignee must be at most 150 characters.").optional(),
  staleDays: z.coerce.number().int().min(1).max(365).default(14)
});

export type StatisticsProblemExportQuery = z.infer<typeof statisticsProblemExportQuerySchema>;

export const statisticsForecastQuerySchema = z.object({
  groupName: z.string().trim().max(120, "Group must be at most 120 characters.").optional(),
  boardId: z.string().trim().max(120, "Board id must be at most 120 characters.").optional(),
  assignee: z.string().trim().max(150, "Assignee must be at most 150 characters.").optional()
});

export type StatisticsForecastQuery = z.infer<typeof statisticsForecastQuerySchema>;
