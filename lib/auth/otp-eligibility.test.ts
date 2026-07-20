import { describe, expect, it } from 'vitest';
import {
  CUSTOMER_OTP_DENIED_ERROR,
  assertCustomerOtpEligible,
} from '@/lib/auth/otp-eligibility';

describe('assertCustomerOtpEligible', () => {
  it('allows customers and null roles', () => {
    expect(assertCustomerOtpEligible('customer')).toEqual({ ok: true });
    expect(assertCustomerOtpEligible(null)).toEqual({ ok: true });
    expect(assertCustomerOtpEligible(undefined)).toEqual({ ok: true });
  });

  it('blocks portal staff with a uniform non-enumerating error', () => {
    for (const role of [
      'admin',
      'super_admin',
      'staff',
      'sales_manager',
      'salesman',
      'warehouse_manager',
      'warehouse_staff',
      'delivery_driver',
    ]) {
      expect(assertCustomerOtpEligible(role)).toEqual({
        ok: false,
        error: CUSTOMER_OTP_DENIED_ERROR,
      });
    }
  });
});
