import { z } from "zod";

export const columnManagerFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Spaltenname ist erforderlich.")
    .max(120, "Spaltenname darf hoechstens 120 Zeichen lang sein.")
});

export const columnManagerFormDefaultValues = {
  title: ""
} satisfies z.infer<typeof columnManagerFormSchema>;

export type ColumnManagerFormValues = z.infer<typeof columnManagerFormSchema>;
