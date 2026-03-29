import { createRequiredTextSchema, z } from "../../lib/forms";

export const boardFormSchema = z.object({
  groupName: createRequiredTextSchema("Gruppe", 100),
  title: createRequiredTextSchema("Board-Titel", 100)
});

export type BoardFormValues = z.infer<typeof boardFormSchema>;

export const boardFormDefaultValues: BoardFormValues = {
  groupName: "",
  title: ""
};
