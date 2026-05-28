import { describe, it, expect } from 'vitest';
import { profileSchema } from '../../schemas/profileSchema';

const valid = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '',
};

describe('profileSchema', () => {
  it('accepts valid data with empty phone', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts valid international phone', () => {
    expect(profileSchema.safeParse({ ...valid, phone: '+12025550123' }).success).toBe(true);
  });

  it('rejects empty firstName', () => {
    expect(profileSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
  });

  it('rejects firstName over 100 chars', () => {
    expect(profileSchema.safeParse({ ...valid, firstName: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects empty lastName', () => {
    expect(profileSchema.safeParse({ ...valid, lastName: '' }).success).toBe(false);
  });

  it('rejects lastName over 100 chars', () => {
    expect(profileSchema.safeParse({ ...valid, lastName: 'b'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid email format', () => {
    expect(profileSchema.safeParse({ ...valid, email: 'bad-email' }).success).toBe(false);
  });

  it('rejects phone number too short', () => {
    expect(profileSchema.safeParse({ ...valid, phone: '123456' }).success).toBe(false);
  });
});
