'use client';

import { useEffect, useState } from 'react';
import {
  getProfileFormDataAction,
  updateProfileAction,
} from '@/actions/profile';
import {
  requestPhoneVerification,
  verifyPhoneAndBind,
} from '@/actions/phone-otp';
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
  const [savedPhone, setSavedPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfileFormDataAction().then((result) => {
      if (result.success && result.data) {
        setFullName(result.data.fullName);
        setPhone(result.data.phone);
        setSavedPhone(result.data.phone);
        setContactEmail(result.data.contactEmail);
        setBillingAddress(result.data.billingAddress);
        setVatNumber(result.data.vatNumber);
      } else if (!result.success) {
        setMessage(result.error ?? 'Failed to load profile.');
      }
      setLoading(false);
    });
  }, []);

  const phoneChanged = phone.trim() !== savedPhone.trim();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    const profileResult = await updateProfileAction({
      fullName: fullName.trim(),
      contactEmail: contactEmail.trim(),
      billingAddress: billingAddress.trim(),
      vatNumber: vatNumber.trim(),
    });

    if (!profileResult.success) {
      setSaving(false);
      setMessage(profileResult.error ?? 'Failed to update profile.');
      return;
    }

    if (!phoneChanged) {
      setSaving(false);
      setMessage('Profile updated. Your receipt details are saved.');
      return;
    }

    if (!otpSent) {
      const sendResult = await requestPhoneVerification(phone.trim());
      setSaving(false);
      if (!sendResult.success) {
        setMessage(sendResult.error ?? 'Failed to send verification code.');
        return;
      }
      setOtpSent(true);
      setDemoCode(sendResult.data?.demoCode);
      setMessage(
        sendResult.data?.demoCode
          ? `Verification code sent. Demo code: ${sendResult.data.demoCode}`
          : 'Verification code sent. Enter it below to confirm your new number.',
      );
      return;
    }

    const bindResult = await verifyPhoneAndBind(phone.trim(), otpCode.trim());
    setSaving(false);
    if (!bindResult.success) {
      setMessage(bindResult.error ?? 'Failed to verify phone number.');
      return;
    }

    setSavedPhone(phone.trim());
    setOtpSent(false);
    setOtpCode('');
    setDemoCode(undefined);
    setMessage('Profile updated. Phone number verified and saved.');
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading profile...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        These details appear on your order receipts and invoices. Changing your
        phone number requires SMS verification.
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
            onChange={(e) => {
              setPhone(e.target.value);
              setOtpSent(false);
              setOtpCode('');
              setDemoCode(undefined);
            }}
            placeholder="+356 7700 0000"
            className={inputClass}
            required
          />
        </Field>

        {phoneChanged && otpSent && (
          <Field id="profile-phone-otp" label="Verification code">
            <input
              id="profile-phone-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="6-digit code"
              className={inputClass}
              required
              maxLength={6}
            />
            {demoCode && (
              <p className="mt-1 text-xs text-slate-500">Demo code: {demoCode}</p>
            )}
          </Field>
        )}

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
            className={`text-sm ${
              message.includes('updated') || message.includes('sent')
                ? 'text-emerald-700'
                : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
        <RippleButton type="submit">
          {saving
            ? 'Saving...'
            : phoneChanged && !otpSent
              ? 'Save & send phone code'
              : phoneChanged && otpSent
                ? 'Verify phone & save'
                : 'Save Profile'}
        </RippleButton>
      </form>
    </div>
  );
}
