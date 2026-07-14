'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminUser,
  deleteAdminUser,
  updateUserRole,
} from '@/actions/admin-users';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminSelectClass,
} from '@/components/admin/admin-styles';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';
import type { UserRole } from '@/types/user';

const ASSIGNABLE_ROLES: UserRole[] = [
  'customer',
  'admin',
  'super_admin',
  'sales_manager',
  'salesman',
  'warehouse_manager',
  'warehouse_staff',
  'delivery_driver',
];

const CREATE_ROLES: UserRole[] = ASSIGNABLE_ROLES.filter((r) => r !== 'customer');

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_disabled: boolean;
  created_at: string;
};

type Props = { users: UserRow[] };

export function UsersManager({ users }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin' as UserRole,
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
              await updateUserRole({ userId: r.id, role: e.target.value as UserRole });
              router.refresh();
            });
          }}
          className={adminSelectClass}
        >
          {ASSIGNABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <ConfirmDestructiveDialog
          title="Delete user permanently?"
          description={`This will permanently remove ${r.email} and cannot be undone.`}
          requireTypedConfirm
          typedConfirmText="DELETE"
          onConfirm={async () => {
            startTransition(async () => {
              await deleteAdminUser(r.id);
              router.refresh();
            });
          }}
        >
          {(open) => (
            <button
              type="button"
              disabled={pending}
              onClick={open}
              className="text-sm text-[var(--admin-danger)] hover:underline"
            >
              Delete
            </button>
          )}
        </ConfirmDestructiveDialog>
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
      <form onSubmit={handleCreate} className={`max-w-xl space-y-4 ${adminCardClass} p-6`}>
        <h2 className={adminHeadingClass}>Create Portal User</h2>
        <input className={adminInputClass} placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input className={adminInputClass} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className={adminInputClass} type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        <select className={adminSelectClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
          {CREATE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}
        <button type="submit" disabled={pending} className={adminButtonPrimaryClass}>
          Create User
        </button>
      </form>

      <AdminDataTable data={users} columns={columns} searchKeys={['email', 'full_name', 'role']} />
    </div>
  );
}
