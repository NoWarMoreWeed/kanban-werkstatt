import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

type UseZodFormOptions<TSchema extends z.ZodTypeAny> = Omit<
  UseFormProps<z.infer<TSchema>>,
  "resolver"
> & {
  schema: TSchema;
};

export function useZodForm<TSchema extends z.ZodTypeAny>({
  schema,
  ...options
}: UseZodFormOptions<TSchema>): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema)
  });
}
