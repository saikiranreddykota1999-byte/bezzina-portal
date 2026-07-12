'use client';

import { useState, useTransition } from 'react';
import { deleteUserAddress, saveUserAddress } from '@/actions/customer-portal';

type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

type Props = { addresses: Address[] };

export function AddressBook({ addresses: initial }: Props) {
  const [addresses, setAddresses] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    label: 'Primary',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'Malta',
    is_default: false,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await saveUserAddress(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteUserAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      {addresses.length === 0 ? (
        <p className="text-sm text-slate-600">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li key={addr.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{addr.label}{addr.is_default ? ' (Default)' : ''}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}{addr.postal_code ? ` ${addr.postal_code}` : ''}, {addr.country}
                  </p>
                </div>
                <button type="button" onClick={() => handleDelete(addr.id)} disabled={pending} className="text-sm text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-slate-900">Add Address</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
          <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address line 1" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
          <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Address line 2" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
          <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="Postal code" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
          Set as default
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
          Save Address
        </button>
      </form>
    </div>
  );
}
