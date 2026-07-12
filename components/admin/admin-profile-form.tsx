import {
  adminCardClass,
  adminLabelClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = {
  email: string;
  fullName: string;
  role: string;
};

export function AdminProfileForm({ email, fullName, role }: Props) {
  return (
    <div className={`${adminCardClass} p-6`}>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className={adminLabelClass}>Email</dt>
          <dd className="mt-1 text-[var(--admin-navy)]">{email}</dd>
        </div>
        <div>
          <dt className={adminLabelClass}>Name</dt>
          <dd className="mt-1 text-[var(--admin-navy)]">{fullName || '—'}</dd>
        </div>
        <div>
          <dt className={adminLabelClass}>Role</dt>
          <dd className="mt-1 capitalize text-[var(--admin-navy)]">{role.replace('_', ' ')}</dd>
        </div>
      </dl>
      <p className={`mt-6 text-xs ${adminSubtextClass}`}>
        To update your password, use the customer account password page while signed in.
      </p>
    </div>
  );
}
