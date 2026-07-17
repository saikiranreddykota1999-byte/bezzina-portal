'use client';

import { useCallback, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { focusRingClass, useDialogA11y } from '@/hooks/use-dialog-a11y';

type Props = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function ProductImageZoom({ open, onClose, src, alt }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  useDialogA11y({
    open,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
  });

  const resetTransform = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    setScale((prev) => {
      const delta = event.deltaY > 0 ? -0.15 : 0.15;
      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
    });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (scale <= 1) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      };
    },
    [offset.x, offset.y, scale],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { startX, startY, originX, originY } = dragRef.current;
    setOffset({
      x: originX + (event.clientX - startX),
      y: originY + (event.clientY - startY),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4"
      onWheel={handleWheel}
    >
      <h2 id={titleId} className="sr-only">
        Enlarged image of {alt}
      </h2>
      <button
        ref={closeRef}
        type="button"
        aria-label="Close image zoom"
        onClick={() => {
          resetTransform();
          onClose();
        }}
        className={`absolute right-4 top-4 z-20 rounded-full bg-white p-2 ${focusRingClass}`}
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      <div
        className={`relative z-10 h-[80vh] w-full max-w-4xl overflow-hidden ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={resetTransform}
      >
        <div
          className="relative h-full w-full transition-transform duration-75"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" priority />
        </div>
      </div>
    </div>
  );
}
