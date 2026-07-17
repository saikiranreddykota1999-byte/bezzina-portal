'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product360Frame } from '@/types/product';
import { focusRingClass } from '@/hooks/use-dialog-a11y';

type Props = {
  frames: Product360Frame[];
  productName: string;
};

const MIN_FRAMES = 8;
const DRAG_THRESHOLD = 12;

export function ProductSpinViewer({ frames, productName }: Props) {
  const sorted =
    frames.length >= MIN_FRAMES
      ? [...frames].sort((a, b) => a.sort_order - b.sort_order)
      : [];

  const [frameIndex, setFrameIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const stepFrame = useCallback(
    (delta: number) => {
      setFrameIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return sorted.length - 1;
        if (next >= sorted.length) return 0;
        return next;
      });
    },
    [sorted.length],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepFrame(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepFrame(1);
      }
    },
    [stepFrame],
  );

  if (sorted.length < MIN_FRAMES) return null;

  const handlePointerDown = (event: React.PointerEvent) => {
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const delta = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < DRAG_THRESHOLD) return;
    stepFrame(delta > 0 ? -1 : 1);
  };

  const activeFrame = sorted[frameIndex];

  return (
    <div
      role="img"
      aria-label="360 degree product view"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartX.current = null;
      }}
      className={`relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 touch-none ${focusRingClass}`}
    >
      <Image
        src={activeFrame.url}
        alt={`${productName} — 360° view frame ${frameIndex + 1} of ${sorted.length}`}
        fill
        className="object-contain p-6 select-none"
        sizes="(max-width: 1024px) 100vw, 50vw"
        draggable={false}
      />
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-slate-600">
        Drag or use arrow keys to rotate · {frameIndex + 1}/{sorted.length}
      </p>
    </div>
  );
}
