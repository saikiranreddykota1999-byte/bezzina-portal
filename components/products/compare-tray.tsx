'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useProductCompare } from '@/hooks/use-product-compare';
import { focusRingClass } from '@/hooks/use-dialog-a11y';

export function CompareTray() {
  const { items, remove, clear } = useProductCompare();

  if (items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Product compare tray"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-lg md:bottom-4 md:left-4 md:right-4 md:max-w-4xl md:rounded-xl md:border"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <p className="hidden shrink-0 text-sm font-semibold text-slate-900 sm:block">
          Compare ({items.length})
        </p>
        <ul className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <li key={item.id} className="relative shrink-0">
              <Link
                href={`/products/${item.slug}`}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 pr-8 hover:border-slate-300"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded bg-white">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      sizes="40px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[10px] text-slate-400">
                      —
                    </span>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-xs font-medium text-slate-800">
                  {item.name}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`Remove ${item.name} from compare`}
                onClick={() => remove(item.id)}
                className={`absolute -right-1 -top-1 rounded-full bg-slate-800 p-0.5 text-white hover:bg-slate-900 ${focusRingClass}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/products/compare"
            className="rounded-full bg-[#0B3D91] px-4 py-2 text-xs font-semibold text-white hover:bg-[#09407a]"
          >
            Compare
          </Link>
          <button
            type="button"
            onClick={clear}
            className={`text-xs text-slate-600 hover:text-slate-900 ${focusRingClass}`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
