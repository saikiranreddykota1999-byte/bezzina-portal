'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettingsAction } from '@/actions/admin-settings';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminLabelClass,
} from '@/components/admin/admin-styles';

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
      {message && <p className="text-sm text-[var(--admin-success)]">{message}</p>}

      <section className={`${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Company Settings</h2>
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
              <label className={`mb-1 block ${adminLabelClass}`}>{field}</label>
              <input name={field} defaultValue={String(company[field] ?? '')} className={adminInputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className={`${adminButtonPrimaryClass} sm:col-span-2`}>
            Save Company
          </button>
        </form>
      </section>

      <section className={`${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Social Links</h2>
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
              <label className={`mb-1 block ${adminLabelClass}`}>{field}</label>
              <input name={field} defaultValue={String(social[field] ?? '')} className={adminInputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className={`${adminButtonPrimaryClass} sm:col-span-3`}>
            Save Social
          </button>
        </form>
      </section>

      <section className={`${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Business Hours</h2>
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
              <label className={`mb-1 block ${adminLabelClass}`}>{day}</label>
              <input name={day} defaultValue={String(businessHours[day] ?? '')} className={adminInputClass} />
            </div>
          ))}
          <button type="submit" disabled={pending} className={`${adminButtonPrimaryClass} sm:col-span-2`}>
            Save Hours
          </button>
        </form>
      </section>
    </div>
  );
}
