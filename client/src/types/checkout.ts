export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface PaymentData {
  method: "card" | "paypal";
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
}

export interface CheckoutData {
  shipping: ShippingData | null;
  addressId: number | null;
  payment: PaymentData | null;
}
