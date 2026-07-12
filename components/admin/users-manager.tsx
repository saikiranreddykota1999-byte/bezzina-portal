'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminUser,
  deleteAdminUser,
  updateUserRole,
} from '@/actions/admin-users';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_disabled: boolean;
  created_at: string;
};

type Props = { users: UserRow[] };

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';

export function UsersManager({ users }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  const columns: Column<UserRow>[] = [
    { key: 'full_name', header: 'Name', sortable: true, render: (r) => r.full_name ?? '—' },
    { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
    {
      key: 'role',
      header: 'Role',
      render: (r) => (
        <select
          value={r.role}
          disabled={pending}
          onChange={(e) => {
            startTransition(async () => {
              await updateUserRole({ userId: r.id, role: e.target.value as 'customer' | 'admin' | 'super_admin' });
              router.refresh();
            });
          }}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
          <option value="customer">Customer</option>
        </select>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm('Delete this user permanently?')) return;
            startTransition(async () => {
              await deleteAdminUser(r.id);
              router.refresh();
            });
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await createAdminUser(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm({ email: '', password: '', full_name: '', role: 'admin' });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Create Admin User</h2>
        <input className={inputClass} placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input className={inputClass} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className={inputClass} type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'super_admin' })}>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Create Admin
        </button>
      </form>

      <AdminDataTable data={users} columns={columns} searchKeys={['email', 'full_name', 'role']} />
    </div>
  );
}
