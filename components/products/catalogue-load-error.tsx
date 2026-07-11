'use client';

import { useRouter } from 'next/navigation';
import { RippleButton } from '@/components/ui/ripple-button';

type Props = {
  message: string;
};

export function CatalogueLoadError({ message }: Props) {
  const router = useRouter();

  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center"
      role="alert"
    >
      <p className="text-sm font-medium text-red-900">Unable to load catalogue</p>
      <p className="mt-2 text-sm text-red-800">{message}</p>
      <RippleButton
        type="button"
        className="mt-6"
        onClick={() => router.refresh()}
      >
        Try again
      </RippleButton>
    </div>
  );
}
