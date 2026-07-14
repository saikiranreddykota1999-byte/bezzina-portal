'use client';

import { scorePasswordStrength, type PasswordStrength } from '@/lib/auth/password-policy';

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  fair: 'bg-orange-400',
  good: 'bg-yellow-400',
  strong: 'bg-emerald-500',
};

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

type Props = {
  password: string;
};

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const strength = scorePasswordStrength(password);
  const width =
    strength === 'weak' ? '25%' : strength === 'fair' ? '50%' : strength === 'good' ? '75%' : '100%';

  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${STRENGTH_COLORS[strength]}`}
          style={{ width }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Strength: <span className="font-medium text-slate-700">{STRENGTH_LABELS[strength]}</span>
        {' — '}12+ chars with upper, lower, number, and special character
      </p>
    </div>
  );
}
