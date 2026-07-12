'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminCustomer } from '@/actions/admin-customers';
import type { AdminCustomer } from '@/types/admin';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = {
  customer: AdminCustomer;
  resetPasswordAction: (userId: string) => Promise<{ success: boolean; error?: string; data?: { email: string } }>;
};

export function CustomerDetailForm({ customer, resetPasswordAction }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateAdminCustomer({
        id: customer.id,
        full_name: String(fd.get('full_name') ?? ''),
        phone: String(fd.get('phone') ?? ''),
        company_name: String(fd.get('company_name') ?? ''),
        is_disabled: fd.get('is_disabled') === 'on',
      });
      setMessage(result.success ? 'Customer updated.' : result.error);
      if (result.success) router.refresh();
    });
  }

  function handleResetPassword() {
    startTransition(async () => {
      const result = await resetPasswordAction(customer.id);
      setMessage(result.success ? `Password reset link sent to ${result.data?.email}` : result.error ?? 'Failed');
    });
  }

  return (
    <form onSubmit={handleSave} className={`${adminCardClass} p-6`}>
      <h2 className={adminHeadingClass}>Edit Customer</h2>
      <div className="mt-4 space-y-4">
        <input name="full_name" defaultValue={customer.full_name ?? ''} className={adminInputClass} placeholder="Full name" />
        <input name="phone" defaultValue={customer.phone ?? ''} className={adminInputClass} placeholder="Phone" />
        <input name="company_name" defaultValue={customer.company_name ?? ''} className={adminInputClass} placeholder="Company" />
        <label className={`flex items-center gap-2 text-sm ${adminSubtextClass}`}>
          <input type="checkbox" name="is_disabled" defaultChecked={customer.is_disabled} />
          Disabled
        </label>
      </div>
      {message && <p className={`mt-4 text-sm ${adminSubtextClass}`}>{message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={adminButtonPrimaryClass}>
          Save
        </button>
        <button type="button" disabled={pending} onClick={handleResetPassword} className={adminButtonSecondaryClass}>
          Send Password Reset
        </button>
      </div>
    </form>
  );
}
