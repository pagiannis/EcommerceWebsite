import { z } from "zod";

export const paymentSchema = z
  .object({
    method: z.enum(["card", "paypal"]),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method !== "card") return;

    if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ""))) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid 16-digit card number",
        path: ["cardNumber"],
      });
    }
    if (!data.cardName || data.cardName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Name on card is required",
        path: ["cardName"],
      });
    }
    if (!data.expiry || !/^\d{2}\/\d{2}$/.test(data.expiry)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter expiry as MM/YY",
        path: ["expiry"],
      });
    }
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid CVV (3–4 digits)",
        path: ["cvv"],
      });
    }
  });
