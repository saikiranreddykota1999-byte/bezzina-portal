'use client';

import { ImagePlus, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent, RefObject } from 'react';

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  pending: boolean;
  error: string | null;
  imagePreviewUrl: string | null;
  onClearImage: () => void;
  onFileChange: (files: FileList | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  canSend: boolean;
};

export function AskBezzinaComposer({
  text,
  onTextChange,
  pending,
  error,
  imagePreviewUrl,
  onClearImage,
  onFileChange,
  onSubmit,
  inputRef,
  fileInputRef,
  canSend,
}: Props) {
  return (
    <div className="border-t border-slate-200/70 bg-white/95 px-3.5 pb-3.5 pt-2.5 backdrop-blur">
      <div className="mb-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>Need a person?</span>
        <span className="flex items-center gap-3">
          <Link
            href="/contact"
            className="font-semibold text-[#0B3D91] underline-offset-2 hover:underline"
          >
            Contact
          </Link>
          <Link
            href="/quote"
            className="font-semibold text-[#0B3D91] underline-offset-2 hover:underline"
          >
            Quote
          </Link>
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        {imagePreviewUrl ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img
              src={imagePreviewUrl}
              alt="Selected upload preview"
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-700">Photo attached</p>
              <button
                type="button"
                onClick={onClearImage}
                className="text-[11px] font-semibold text-[#0B3D91] hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-1.5 rounded-[22px] border border-slate-200 bg-[#F8FAFC] p-1.5 shadow-[inset_0_1px_2px_rgba(7,27,53,0.04)] transition focus-within:border-[#0B3D91]/50 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(11,61,145,0.08)]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            id="ask-bezzina-image"
            onChange={(e) => onFileChange(e.target.files)}
            disabled={pending}
          />
          <label
            htmlFor="ask-bezzina-image"
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-[#0B3D91] transition hover:bg-[#0B3D91]/8"
            title="Attach photo"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Attach photo</span>
          </label>

          <label htmlFor="ask-bezzina-message" className="sr-only">
            Message
          </label>
          <textarea
            id="ask-bezzina-message"
            ref={inputRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={1}
            maxLength={1000}
            placeholder="Ask hours, or describe a part…"
            className="max-h-28 min-h-11 flex-1 resize-none bg-transparent py-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            disabled={pending}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />

          <button
            type="submit"
            disabled={pending || !canSend}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#071B35] text-white shadow-[0_8px_18px_rgba(11,61,145,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {error ? (
          <p className="px-1 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <p className="px-1 text-center text-[10px] text-slate-400">
            Photos help us match catalogue parts · Enter to send
          </p>
        )}
      </form>
    </div>
  );
}
