import {
  createRequiredDateSchema,
  createRequiredIdSchema,
  createRequiredTextSchema,
  z
} from "../../lib/forms";

const cardTextMaxLength = 150;
const priorityValues = ["1", "2", "3", "4"] as const;

function isTodayOrFuture(value: string) {
  const selectedDate = new Date(value);

  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate.getTime() >= today.getTime();
}

export const cardBaseFormSchema = z.object({
  responsibleName: createRequiredTextSchema("Zuständige Person", cardTextMaxLength),
  deviceName: createRequiredTextSchema("Gerätebezeichnung", cardTextMaxLength),
  priority: z.enum(priorityValues, {
    required_error: "Priorität ist erforderlich.",
    invalid_type_error: "Priorität muss 1, 2, 3 oder 4 sein."
  }),
  dueDate: createRequiredDateSchema("Eckende").refine(
    (value) => isTodayOrFuture(value),
    "Eckende darf nicht in der Vergangenheit liegen."
  ),
  partNumber: createRequiredTextSchema("P/N", cardTextMaxLength),
  serialNumber: createRequiredTextSchema("S/N", cardTextMaxLength),
  sapNumber: createRequiredTextSchema("Auftragsnummer", cardTextMaxLength),
  orderNumber: createRequiredTextSchema("Meldungsnummer", cardTextMaxLength)
});

export const createCardFormSchema = cardBaseFormSchema.extend({
  boardId: createRequiredIdSchema("Board"),
  columnId: createRequiredIdSchema("Spalte")
});

export const updateCardFormSchema = cardBaseFormSchema;

export type CardBaseFormValues = z.infer<typeof cardBaseFormSchema>;
export type CreateCardFormValues = z.infer<typeof createCardFormSchema>;
export type UpdateCardFormValues = z.infer<typeof updateCardFormSchema>;
export type CardPriorityValue = (typeof priorityValues)[number];

export const cardPriorityOptions = priorityValues;

export const cardBaseFormDefaultValues: CardBaseFormValues = {
  responsibleName: "",
  deviceName: "",
  priority: "2",
  dueDate: "",
  partNumber: "",
  serialNumber: "",
  sapNumber: "",
  orderNumber: ""
};

export const createCardFormDefaultValues: CreateCardFormValues = {
  boardId: "",
  columnId: "",
  ...cardBaseFormDefaultValues
};
