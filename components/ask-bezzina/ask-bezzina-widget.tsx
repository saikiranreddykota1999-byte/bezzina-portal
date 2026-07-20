'use client';

import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

import { askBezzinaAction } from '@/actions/ask-bezzina';
import { AskBezzinaAvatar } from '@/components/ask-bezzina/ask-bezzina-avatar';
import {
  AskBezzinaMessageList,
  type ChatBubble,
} from '@/components/ask-bezzina/ask-bezzina-message-list';
import { company } from '@/config/company';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import type { AskBezzinaHistoryMessage } from '@/lib/ask-bezzina/types';

const MAX_HISTORY_FOR_REQUEST = 8;

function toHistory(messages: ChatBubble[]): AskBezzinaHistoryMessage[] {
  return messages
    .filter((m) => m.content.trim().length > 0 && !m.isError)
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
  const messageIdRef = useRef(0);

  function nextMessageId(prefix: 'u' | 'a'): string {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  }

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

  function clearImage(options?: { keepPreviewUrl?: boolean }) {
    if (options?.keepPreviewUrl) {
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

  function submitMessage(trimmed: string, file: File | null, previewUrl: string | null) {
    if (pending || (!trimmed && !file)) return;

    const userBubble: ChatBubble = {
      id: nextMessageId('u'),
      role: 'user',
      content: trimmed || 'Photo attached — please identify this part.',
      imagePreviewUrl: previewUrl ?? undefined,
    };

    const history = toHistory(messages);
    const formData = new FormData();
    formData.set('message', trimmed);
    formData.set('history', JSON.stringify(history));
    if (file) formData.set('image', file);

    setMessages((prev) => [...prev, userBubble]);
    setText('');
    clearImage({ keepPreviewUrl: Boolean(previewUrl) });
    setError(null);

    startTransition(async () => {
      const result = await askBezzinaAction(formData);
      if (!result.success) {
        setError(result.error);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId('a'),
            role: 'assistant',
            content: result.error,
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId('a'),
          role: 'assistant',
          content: result.data.reply,
          matches: result.data.matches,
        },
      ]);
    });
  }

  function sendQuickPrompt(prompt: string) {
    submitMessage(prompt, null, null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(text.trim(), imageFile, imagePreviewUrl);
  }

  return (
    <>
      {!open ? (
        <div className="site-chrome fixed z-50 bottom-20 right-4 md:bottom-6 md:right-6">
          <div className="ask-bezzina-tip pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-full bg-[#071B35] px-3 py-1.5 text-xs font-medium text-white shadow-lg sm:block">
            Ready to help
            <span
              className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-[#071B35]"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-[#0B3D91]/25 transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            <AskBezzinaAvatar size="md" attentive />
            <span className="sr-only">Open Ask Bezzina — ready to help</span>
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          className="site-chrome fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-[2px] md:bg-slate-900/20"
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
          className="site-chrome fixed z-[60] flex w-[min(100vw-1.25rem,24rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(7,27,53,0.22)] bottom-20 right-3 max-h-[min(78vh,40rem)] md:bottom-6 md:right-6"
        >
          <header className="relative overflow-hidden bg-gradient-to-br from-[#071B35] via-[#0B3D91] to-[#09407a] px-4 py-3.5 text-white">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#D8A106]/15" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <AskBezzinaAvatar size="sm" attentive />
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="truncate text-sm font-semibold tracking-tight">
                  Ask {company.shortName}
                </h2>
                <p className="flex items-center gap-1.5 truncate text-xs text-emerald-200">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                  Online · ready to help
                </p>
              </div>
              <Image
                src={company.logoUrl}
                alt=""
                width={28}
                height={28}
                className="rounded-lg bg-white object-contain p-0.5"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close Ask Bezzina"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%)] px-3 py-3">
            <AskBezzinaMessageList messages={messages} />
            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-1.5 px-1">
                {['Business hours', 'Phone & WhatsApp', 'Where are you?'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendQuickPrompt(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#0B3D91] hover:text-[#0B3D91]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
            {pending ? (
              <p
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm ring-1 ring-slate-100"
                role="status"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0B3D91]" aria-hidden="true" />
                Looking at your request…
              </p>
            ) : null}
            <div ref={listEndRef} />
          </div>

          <div className="border-t border-slate-100 bg-white px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Prefer a person?</span>
              <span className="flex gap-2">
                <Link href="/contact" className="font-semibold text-[#0B3D91] hover:underline">
                  Contact
                </Link>
                <Link href="/quote" className="font-semibold text-[#0B3D91] hover:underline">
                  Quote
                </Link>
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {imagePreviewUrl ? (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
                  <img
                    src={imagePreviewUrl}
                    alt="Selected upload preview"
                    className="h-11 w-11 rounded-lg object-cover"
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

              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner focus-within:border-[#0B3D91] focus-within:ring-2 focus-within:ring-[#0B3D91]/20">
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
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#0B3D91] transition hover:bg-white"
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
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  maxLength={1000}
                  placeholder="Ask about hours, or describe a part…"
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
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
                  disabled={pending || (!text.trim() && !imageFile)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B3D91] text-white transition hover:bg-[#09407a] disabled:cursor-not-allowed disabled:opacity-50"
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
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
