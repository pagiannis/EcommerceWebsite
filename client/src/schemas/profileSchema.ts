import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .refine(
      (val) => val === "" || /^\+?[0-9]{10,15}$/.test(val),
      "Phone must be 10–15 digits, optionally starting with +",
    ),
});

export type ProfileValues = z.infer<typeof profileSchema>;
