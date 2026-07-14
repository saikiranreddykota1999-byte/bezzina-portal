'use client';

import { useState } from 'react';

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  requireTypedConfirm?: boolean;
  typedConfirmText?: string;
  onConfirm: () => void | Promise<void>;
  children?: (open: () => void) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ConfirmDestructiveDialog({
  title,
  description,
  confirmLabel = 'Delete',
  requireTypedConfirm = false,
  typedConfirmText = 'DELETE',
  onConfirm,
  children,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function setOpen(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
      return;
    }
    setInternalOpen(next);
  }
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = !requireTypedConfirm || typed === typedConfirmText;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
      setTyped('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {children?.(() => setOpen(true))}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            {requireTypedConfirm && (
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-700">
                  Type <span className="font-mono">{typedConfirmText}</span> to confirm
                </label>
                <input
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  autoComplete="off"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setTyped('');
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirm || loading}
                onClick={handleConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Working…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
