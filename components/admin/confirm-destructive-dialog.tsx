'use client';

import { useId, useRef, useState } from 'react';
import { focusRingClass, useDialogA11y } from '@/hooks/use-dialog-a11y';

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
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;
  const titleId = useId();
  const descriptionId = useId();
  const confirmInputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  function setOpen(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
      return;
    }
    setInternalOpen(next);
  }

  useDialogA11y({
    open,
    onClose: () => {
      setOpen(false);
      setTyped('');
    },
    containerRef: dialogRef,
    initialFocusRef: cancelRef,
  });

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
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm text-slate-600">
              {description}
            </p>
            {requireTypedConfirm ? (
              <div className="mt-4">
                <label htmlFor={confirmInputId} className="text-xs font-medium text-slate-700">
                  Type <span className="font-mono">{typedConfirmText}</span> to confirm
                </label>
                <input
                  id={confirmInputId}
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${focusRingClass}`}
                  autoComplete="off"
                />
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => {
                  setOpen(false);
                  setTyped('');
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${focusRingClass}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirm || loading}
                onClick={() => void handleConfirm()}
                className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 ${focusRingClass}`}
              >
                {loading ? 'Working…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
