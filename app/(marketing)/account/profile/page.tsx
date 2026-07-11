'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RippleButton } from '@/components/ui/ripple-button';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? '');
        setFullName(user.user_metadata?.full_name ?? '');
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });
    setMessage(error ? error.message : 'Profile updated.');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <form onSubmit={handleSave} className="mt-8 max-w-md space-y-4">
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <RippleButton type="submit">Save Profile</RippleButton>
      </form>
    </div>
  );
}
