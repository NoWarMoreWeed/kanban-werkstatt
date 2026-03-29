import { z } from "zod";
import { createRequiredTextSchema } from "../../lib/forms";

export const commentFormSchema = z.object({
  authorName: createRequiredTextSchema("Name", 120),
  message: createRequiredTextSchema("Nachricht", 1000)
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;

export const commentFormDefaultValues: CommentFormValues = {
  authorName: "",
  message: ""
};
