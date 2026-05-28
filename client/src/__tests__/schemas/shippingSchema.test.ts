import { describe, it, expect } from 'vitest';
import { shippingSchema } from '../../schemas/shippingSchema';

const valid = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'New York',
  zip: '10001',
  country: 'US',
};

describe('shippingSchema', () => {
  it('accepts valid data', () => {
    expect(shippingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty firstName', () => {
    const result = shippingSchema.safeParse({ ...valid, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty lastName', () => {
    expect(shippingSchema.safeParse({ ...valid, lastName: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(shippingSchema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false);
  });

  it('accepts empty phone', () => {
    expect(shippingSchema.safeParse({ ...valid, phone: '' }).success).toBe(true);
  });

  it('rejects phone shorter than 10 digits', () => {
    expect(shippingSchema.safeParse({ ...valid, phone: '123456' }).success).toBe(false);
  });

  it('accepts phone with + prefix', () => {
    expect(shippingSchema.safeParse({ ...valid, phone: '+14155552671' }).success).toBe(true);
  });

  it('rejects address shorter than 5 chars', () => {
    expect(shippingSchema.safeParse({ ...valid, address: 'Elm' }).success).toBe(false);
  });

  it('rejects empty city', () => {
    expect(shippingSchema.safeParse({ ...valid, city: '' }).success).toBe(false);
  });

  it('rejects empty zip', () => {
    expect(shippingSchema.safeParse({ ...valid, zip: '' }).success).toBe(false);
  });

  it('rejects empty country', () => {
    expect(shippingSchema.safeParse({ ...valid, country: '' }).success).toBe(false);
  });
});
