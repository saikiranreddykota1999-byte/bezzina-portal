'use client';

import { useEffect, useState } from 'react';
import {
  getProfileFormDataAction,
  updateProfileAction,
} from '@/actions/profile';
import { RippleButton } from '@/components/ui/ripple-button';

const inputClass =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900';

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfileFormDataAction().then((result) => {
      if (result.success && result.data) {
        setFullName(result.data.fullName);
        setPhone(result.data.phone);
        setContactEmail(result.data.contactEmail);
        setBillingAddress(result.data.billingAddress);
        setVatNumber(result.data.vatNumber);
      } else if (!result.success) {
        setMessage(result.error ?? 'Failed to load profile.');
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    const result = await updateProfileAction({
      fullName: fullName.trim(),
      phone: phone.trim(),
      contactEmail: contactEmail.trim(),
      billingAddress: billingAddress.trim(),
      vatNumber: vatNumber.trim(),
    });

    setSaving(false);
    setMessage(
      result.success
        ? 'Profile updated. Your receipt details are saved.'
        : result.error ?? 'Failed to update profile.',
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading profile...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        These details appear on your order receipts and invoices.
      </p>
      <form onSubmit={handleSave} className="mt-8 max-w-md space-y-4">
        <Field id="profile-name" label="Name">
          <input
            id="profile-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className={inputClass}
            required
            autoComplete="name"
          />
        </Field>

        <Field id="profile-phone" label="Number">
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+356 7700 0000"
            className={inputClass}
            required
          />
        </Field>

        <Field id="profile-email" label="Mail ID">
          <input
            id="profile-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </Field>

        <Field id="profile-address" label="Address">
          <textarea
            id="profile-address"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            placeholder="Street, city, postal code, Malta"
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field id="profile-vat" label="VAT">
          <input
            id="profile-vat"
            type="text"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder="MT12345678"
            className={inputClass}
          />
        </Field>

        {message && (
          <p
            className={`text-sm ${message.includes('updated') ? 'text-emerald-700' : 'text-red-600'}`}
          >
            {message}
          </p>
        )}
        <RippleButton type="submit">
          {saving ? 'Saving...' : 'Save Profile'}
        </RippleButton>
      </form>
    </div>
  );
}
