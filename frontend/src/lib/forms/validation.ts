import { z } from "zod";

export const createRequiredTextSchema = (label: string, maxLength = 150) =>
  z
    .string({
      required_error: `${label} ist erforderlich.`
    })
    .trim()
    .min(1, `${label} ist erforderlich.`)
    .max(maxLength, `${label} darf höchstens ${maxLength} Zeichen lang sein.`);

export const createOptionalTextSchema = (label: string, maxLength = 150) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} darf höchstens ${maxLength} Zeichen lang sein.`)
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional();

export const createRequiredIdSchema = (label: string) =>
  z
    .string({
      required_error: `${label} ist erforderlich.`
    })
    .trim()
    .min(1, `${label} ist erforderlich.`);

export const createRequiredDateSchema = (label: string) =>
  z
    .string({
      required_error: `${label} ist erforderlich.`
    })
    .trim()
    .min(1, `${label} ist erforderlich.`)
    .refine((value) => !Number.isNaN(Date.parse(value)), `${label} ist kein gültiges Datum.`);

export { z };
