import { describe, expect, it } from 'vitest';
import {
  STAFF_OTP_LOGIN_ERROR,
  assertCustomerOtpEligible,
} from '@/lib/auth/otp-eligibility';

describe('assertCustomerOtpEligible', () => {
  it('allows customers and null roles', () => {
    expect(assertCustomerOtpEligible('customer')).toEqual({ ok: true });
    expect(assertCustomerOtpEligible(null)).toEqual({ ok: true });
    expect(assertCustomerOtpEligible(undefined)).toEqual({ ok: true });
  });

  it('blocks portal staff roles', () => {
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
        error: STAFF_OTP_LOGIN_ERROR,
      });
    }
  });
});
