'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminCustomer } from '@/actions/admin-customers';
import type { AdminCustomer } from '@/types/admin';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

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
    <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold">Edit Customer</h2>
      <div className="mt-4 space-y-4">
        <input name="full_name" defaultValue={customer.full_name ?? ''} className={inputClass} placeholder="Full name" />
        <input name="phone" defaultValue={customer.phone ?? ''} className={inputClass} placeholder="Phone" />
        <input name="company_name" defaultValue={customer.company_name ?? ''} className={inputClass} placeholder="Company" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_disabled" defaultChecked={customer.is_disabled} />
          Disabled
        </label>
      </div>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
          Save
        </button>
        <button type="button" disabled={pending} onClick={handleResetPassword} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          Send Password Reset
        </button>
      </div>
    </form>
  );
}
