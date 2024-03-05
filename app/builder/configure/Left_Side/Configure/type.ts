import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(3),
  instructions: z.string().min(1),
  model: z.string(),
  toolNames: z.array(z.string()),
});

export type IConfigureFormType = UseFormReturn<z.infer<typeof formSchema>>;