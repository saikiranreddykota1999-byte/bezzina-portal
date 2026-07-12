type Props = {
  email: string;
  fullName: string;
  role: string;
};

export function AdminProfileForm({ email, fullName, role }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Email</dt>
          <dd className="mt-1 text-slate-900 dark:text-white">{email}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Name</dt>
          <dd className="mt-1 text-slate-900 dark:text-white">{fullName || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Role</dt>
          <dd className="mt-1 capitalize text-slate-900 dark:text-white">{role.replace('_', ' ')}</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-slate-500">
        To update your password, use the customer account password page while signed in.
      </p>
    </div>
  );
}
