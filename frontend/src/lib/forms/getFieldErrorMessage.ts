import type { FieldError } from "react-hook-form";

export function getFieldErrorMessage(error?: FieldError) {
  return error?.message;
}
