import { describe, expect, it } from 'vitest';
import {
  amountInWords,
  buildReceiptTotals,
  formatInvoiceNumber,
  resolveReceiptCustomer,
  splitVatInclusive,
} from '@/lib/receipt';

describe('splitVatInclusive', () => {
  it('splits 18% VAT from gross amount', () => {
    const result = splitVatInclusive(1.18);
    expect(result.net).toBe(1);
    expect(result.vat).toBe(0.18);
    expect(result.gross).toBe(1.18);
  });
});

describe('buildReceiptTotals', () => {
  it('calculates net, VAT, and gross totals', () => {
    const totals = buildReceiptTotals(4, 0);
    expect(totals.totalGross).toBe(4);
    expect(totals.totalVat).toBeCloseTo(0.61, 2);
    expect(totals.subtotalNet).toBeCloseTo(3.39, 2);
  });
});

describe('formatInvoiceNumber', () => {
  it('formats valid JB invoice numbers', () => {
    expect(formatInvoiceNumber('JB-2026-3828')).toBe('JB-2026-3828');
  });

  it('returns dash for missing values', () => {
    expect(formatInvoiceNumber(null)).toBe('—');
    expect(formatInvoiceNumber('   ')).toBe('—');
  });
});

describe('amountInWords', () => {
  it('converts whole euro amounts', () => {
    expect(amountInWords(4)).toBe('Four Euro and Zero Cents');
  });

  it('converts single euro amounts', () => {
    expect(amountInWords(1)).toBe('One Euro and Zero Cents');
  });
});

describe('resolveReceiptCustomer', () => {
  it('prefers current profile over order snapshot', () => {
    const customer = resolveReceiptCustomer(
      {
        customer_name: 'Old Snapshot Name',
        customer_phone: '+356 0000',
        customer_email: 'old@example.com',
      },
      {
        full_name: 'Updated Profile Name',
        phone: '+356 9999',
        contact_email: 'new@example.com',
      },
      null,
    );

    expect(customer.full_name).toBe('Updated Profile Name');
    expect(customer.phone).toBe('+356 9999');
    expect(customer.email).toBe('new@example.com');
  });

  it('falls back to order snapshot when profile is empty', () => {
    const customer = resolveReceiptCustomer(
      {
        customer_name: 'Snapshot Name',
        customer_phone: '+356 9999',
        customer_email: 'buyer@example.com',
        customer_company_name: 'Buyer Ltd',
        customer_vat_number: 'MT111',
      },
      null,
      null,
    );

    expect(customer.full_name).toBe('Snapshot Name');
    expect(customer.phone).toBe('+356 9999');
    expect(customer.email).toBe('buyer@example.com');
    expect(customer.company_name).toBe('Buyer Ltd');
    expect(customer.vat_number).toBe('MT111');
  });

  it('falls back to profile and auth user fields', () => {
    const customer = resolveReceiptCustomer(
      {},
      {
        full_name: 'Saikiran Reddy Kota',
        phone: '+356 7700',
        contact_email: 'real@example.com',
        billing_address: 'Gzira, Malta',
      },
      {
        id: 'user-1',
        email: '35677576721@phone.otp.bezzina',
        phone: '+356 7700',
        user_metadata: { full_name: 'Meta Name' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '',
      },
    );

    expect(customer.full_name).toBe('Saikiran Reddy Kota');
    expect(customer.phone).toBe('+356 7700');
    expect(customer.email).toBe('real@example.com');
    expect(customer.address).toBe('Gzira, Malta');
  });

  it('ignores synthetic phone login emails', () => {
    const customer = resolveReceiptCustomer(
      {},
      { email: '35677576721@phone.otp.bezzina', contact_email: 'customer@example.com' },
      { id: '1', email: '35677576721@phone.otp.bezzina', user_metadata: {}, app_metadata: {}, aud: 'authenticated', created_at: '' },
    );

    expect(customer.email).toBe('customer@example.com');
  });
});
