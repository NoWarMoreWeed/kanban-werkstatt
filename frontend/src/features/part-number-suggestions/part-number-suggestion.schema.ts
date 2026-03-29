import { createOptionalTextSchema, createRequiredTextSchema, z } from "../../lib/forms";

export const partNumberSuggestionFormSchema = z.object({
  partNumber: createRequiredTextSchema("P/N", 150),
  deviceName: createOptionalTextSchema("Geraetebezeichnung", 150)
});

export type PartNumberSuggestionFormValues = z.infer<typeof partNumberSuggestionFormSchema>;

export const partNumberSuggestionFormDefaultValues: PartNumberSuggestionFormValues = {
  partNumber: "",
  deviceName: ""
};
