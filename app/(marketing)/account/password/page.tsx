'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RippleButton } from '@/components/ui/ripple-button';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : 'Password updated successfully.');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <RippleButton type="submit">Update Password</RippleButton>
      </form>
    </div>
  );
}
