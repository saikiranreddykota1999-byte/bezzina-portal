'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';

type Props = {
  onScan: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function BarcodeScanner({ onScan, placeholder = 'Scan barcode or enter SKU…', disabled }: Props) {
  const [value, setValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      onScan(trimmed);
      setValue('');
    },
    [onScan],
  );

  useEffect(() => {
    if (!scanning || disabled) return;

    const detectorCtor = (window as Window & { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    if (!detectorCtor || !navigator.mediaDevices?.getUserMedia) {
      const timer = setTimeout(() => setScanning(false), 0);
      return () => clearTimeout(timer);
    }

    const Detector = detectorCtor;

    let stream: MediaStream | null = null;
    let video: HTMLVideoElement | null = null;
    let frameId = 0;
    let cancelled = false;

    async function start() {
      try {
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) return;

        video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        await video.play();

        const tick = async () => {
          if (!video || cancelled) return;
          try {
            const codes = await detector.detect(video);
            if (codes[0]?.rawValue) {
              submit(codes[0].rawValue);
              setScanning(false);
              return;
            }
          } catch {
            // ignore frame errors
          }
          frameId = requestAnimationFrame(() => void tick());
        };
        void tick();
      } catch {
        setScanning(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, disabled, submit]);

  function handleChange(next: string) {
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => submit(next), 300);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit(value);
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900"
        />
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setScanning((v) => !v)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
      >
        {scanning ? 'Stop camera' : 'Scan'}
      </button>
    </div>
  );
}
