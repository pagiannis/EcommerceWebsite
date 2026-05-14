import { z } from "zod";

export const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().refine(
    (val) => val === "" || /^\+?[0-9]{10,15}$/.test(val),
    "Phone must be 10–15 digits, optionally starting with +"
  ),
  address: z.string().min(5, "Enter a valid street address"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP / postal code is required"),
  country: z.string().min(1, "Country is required"),
});
