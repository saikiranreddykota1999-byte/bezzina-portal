'use client';

import { ImagePlus, Loader2, MessageCircle, Send, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

import { askBezzinaAction } from '@/actions/ask-bezzina';
import {
  AskBezzinaMessageList,
  type ChatBubble,
} from '@/components/ask-bezzina/ask-bezzina-message-list';
import { RippleButton } from '@/components/ui/ripple-button';
import { company } from '@/config/company';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import type { AskBezzinaHistoryMessage } from '@/lib/ask-bezzina/types';
import { brandClasses } from '@/lib/brand';

const MAX_HISTORY_FOR_REQUEST = 8;

function toHistory(messages: ChatBubble[]): AskBezzinaHistoryMessage[] {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY_FOR_REQUEST)
    .map((m) => ({ role: m.role, content: m.content }));
}

export function AskBezzinaWidget() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useDialogA11y({
    open,
    onClose: () => setOpen(false),
    containerRef: panelRef,
    initialFocusRef: inputRef,
    lockScroll: false,
  });

  useEffect(() => {
    if (!open) return;
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open, pending]);

  function revokePreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreviewUrl(null);
  }

  /** Clear the composer image. When keepPreviewUrl, the blob URL is left for the chat bubble. */
  function clearImage(options?: { keepPreviewUrl?: boolean }) {
    if (options?.keepPreviewUrl) {
      // Transfer ownership to the message bubble for the session.
      previewUrlRef.current = null;
      setImagePreviewUrl(null);
    } else {
      revokePreview();
    }
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    setError(null);
    revokePreview();
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setImagePreviewUrl(url);
    }
    setImageFile(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (pending || (!trimmed && !imageFile)) return;

    const userBubble: ChatBubble = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed || 'Photo attached — please identify this part.',
      imagePreviewUrl: imagePreviewUrl ?? undefined,
    };

    const history = toHistory(messages);
    const formData = new FormData();
    formData.set('message', trimmed);
    formData.set('history', JSON.stringify(history));
    if (imageFile) formData.set('image', imageFile);

    setMessages((prev) => [...prev, userBubble]);
    setText('');
    clearImage({ keepPreviewUrl: Boolean(imagePreviewUrl) });
    setError(null);

    startTransition(async () => {
      const result = await askBezzinaAction(formData);
      if (!result.success) {
        setError(result.error);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: result.error,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: result.data.reply,
          matches: result.data.matches,
        },
      ]);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="site-chrome fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B3D91] text-white shadow-lg transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 bottom-20 right-4 md:bottom-6 md:right-6"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Open Ask Bezzina</span>
      </button>

      {open ? (
        <div
          className="site-chrome fixed inset-0 z-[60] bg-slate-900/40 md:bg-transparent"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="site-chrome fixed z-[60] flex w-[min(100vw-1.5rem,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl bottom-20 right-3 max-h-[min(70vh,36rem)] md:bottom-6 md:right-6 md:max-h-[min(75vh,40rem)]"
        >
          <header className="flex items-center gap-3 border-b border-slate-200 bg-[#071B35] px-4 py-3 text-white">
            <Image
              src={company.logoUrl}
              alt=""
              width={36}
              height={36}
              className="rounded-md bg-white object-contain p-0.5"
            />
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate text-sm font-semibold">
                Ask {company.shortName}
              </h2>
              <p className="truncate text-xs text-slate-300">
                Identify parts · catalogue matches
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close Ask Bezzina"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            <AskBezzinaMessageList messages={messages} />
            {pending ? (
              <p className="flex items-center gap-2 text-xs text-slate-500" role="status">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Looking at your request…
              </p>
            ) : null}
            <div ref={listEndRef} />
          </div>

          <div className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
            Prefer a person?{' '}
            <Link href="/contact" className={brandClasses.link}>
              Contact
            </Link>
            {' · '}
            <Link href="/quote" className={brandClasses.link}>
              Quote
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
            {imagePreviewUrl ? (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
                <img
                  src={imagePreviewUrl}
                  alt="Selected upload preview"
                  className="h-12 w-12 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => clearImage()}
                  className="text-xs font-semibold text-slate-700 underline"
                >
                  Remove photo
                </button>
              </div>
            ) : null}

            <label htmlFor="ask-bezzina-message" className="sr-only">
              Message
            </label>
            <textarea
              id="ask-bezzina-message"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Describe the part or ask about hours…"
              className={`${brandClasses.input} resize-none`}
              disabled={pending}
            />

            {error ? (
              <p className="mt-2 text-xs text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                id="ask-bezzina-image"
                onChange={(e) => handleFileChange(e.target.files)}
                disabled={pending}
              />
              <label
                htmlFor="ask-bezzina-image"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#0B3D91]"
              >
                <ImagePlus className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                Photo
              </label>
              <RippleButton
                type="submit"
                disabled={pending || (!text.trim() && !imageFile)}
                className="ml-auto gap-1.5 px-4 py-2 text-xs"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Send
              </RippleButton>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
