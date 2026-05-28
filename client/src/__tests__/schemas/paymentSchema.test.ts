import { describe, it, expect } from 'vitest';
import { paymentSchema } from '../../schemas/paymentSchema';

const validCard = {
  method: 'card' as const,
  cardNumber: '1234567890123456',
  cardName: 'John Doe',
  expiry: '12/26',
  cvv: '123',
};

describe('paymentSchema', () => {
  it('accepts paypal without card fields', () => {
    expect(paymentSchema.safeParse({ method: 'paypal' }).success).toBe(true);
  });

  it('accepts valid card data', () => {
    expect(paymentSchema.safeParse(validCard).success).toBe(true);
  });

  it('accepts card number with spaces', () => {
    expect(
      paymentSchema.safeParse({ ...validCard, cardNumber: '1234 5678 9012 3456' }).success
    ).toBe(true);
  });

  it('accepts 4-digit CVV', () => {
    expect(paymentSchema.safeParse({ ...validCard, cvv: '1234' }).success).toBe(true);
  });

  it('rejects card with invalid card number length', () => {
    const result = paymentSchema.safeParse({ ...validCard, cardNumber: '1234' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cardNumber).toBeDefined();
    }
  });

  it('rejects card with name shorter than 2 chars', () => {
    expect(paymentSchema.safeParse({ ...validCard, cardName: 'J' }).success).toBe(false);
  });

  it('rejects card with wrong expiry format', () => {
    expect(paymentSchema.safeParse({ ...validCard, expiry: '1226' }).success).toBe(false);
  });

  it('rejects card with CVV shorter than 3 digits', () => {
    expect(paymentSchema.safeParse({ ...validCard, cvv: '12' }).success).toBe(false);
  });

  it('rejects card with CVV longer than 4 digits', () => {
    expect(paymentSchema.safeParse({ ...validCard, cvv: '12345' }).success).toBe(false);
  });

  it('rejects unknown method', () => {
    expect(paymentSchema.safeParse({ method: 'crypto' }).success).toBe(false);
  });
});
