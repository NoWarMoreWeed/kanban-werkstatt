import { createRequiredTextSchema, z } from "../../lib/forms";

export const managerModeFormSchema = z.object({
  password: createRequiredTextSchema("Passwort", 200)
});

export type ManagerModeFormValues = z.infer<typeof managerModeFormSchema>;

export const managerModeFormDefaultValues: ManagerModeFormValues = {
  password: ""
};
