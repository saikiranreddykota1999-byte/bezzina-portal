'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettingsAction } from '@/actions/admin-settings';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

type Props = {
  company: Record<string, unknown>;
  social: Record<string, unknown>;
  businessHours: Record<string, unknown>;
};

export function SettingsManager({ company, social, businessHours }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function save(key: 'company' | 'social' | 'business_hours', value: Record<string, unknown>) {
    setMessage('');
    startTransition(async () => {
      const result = await updateSiteSettingsAction(key, value);
      setMessage(result.success ? 'Settings saved.' : result.error);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {message && <p className="text-sm text-green-700">{message}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Company Settings</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save('company', Object.fromEntries(fd.entries()));
          }}
        >
          {['name', 'email', 'phone', 'whatsapp', 'address', 'logoUrl', 'faviconUrl'].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">{field}</label>
              <input name={field} defaultValue={String(company[field] ?? '')} className={inputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
            Save Company
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Social Links</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save('social', Object.fromEntries(fd.entries()));
          }}
        >
          {['facebook', 'instagram', 'linkedin'].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">{field}</label>
              <input name={field} defaultValue={String(social[field] ?? '')} className={inputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white sm:col-span-3">
            Save Social
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Business Hours</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save('business_hours', Object.fromEntries(fd.entries()));
          }}
        >
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day}>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">{day}</label>
              <input name={day} defaultValue={String(businessHours[day] ?? '')} className={inputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
            Save Hours
          </button>
        </form>
      </section>
    </div>
  );
}
