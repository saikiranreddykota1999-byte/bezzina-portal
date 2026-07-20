'use client';

import { Clock3, MapPin, Phone, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState, useTransition } from 'react';

import { askBezzinaAction } from '@/actions/ask-bezzina';
import { AskBezzinaAvatar } from '@/components/ask-bezzina/ask-bezzina-avatar';
import { AskBezzinaComposer } from '@/components/ask-bezzina/ask-bezzina-composer';
import {
  AskBezzinaMessageList,
  AskBezzinaTypingIndicator,
  type ChatBubble,
} from '@/components/ask-bezzina/ask-bezzina-message-list';
import { company } from '@/config/company';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import type { AskBezzinaHistoryMessage } from '@/lib/ask-bezzina/types';

const MAX_HISTORY_FOR_REQUEST = 8;

const QUICK_PROMPTS = [
  { label: 'Hours', prompt: 'Business hours', icon: Clock3 },
  { label: 'Contact', prompt: 'Phone & WhatsApp', icon: Phone },
  { label: 'Location', prompt: 'Where are you?', icon: MapPin },
] as const;

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

  return (
    <>
      {!open ? (
        <div className="site-chrome fixed z-50 bottom-20 right-4 md:bottom-6 md:right-6">
          <div className="ask-bezzina-tip pointer-events-none absolute bottom-[calc(100%+10px)] right-0 hidden items-center gap-2 rounded-2xl border border-white/10 bg-[#071B35]/95 px-3.5 py-2 text-xs font-medium text-white shadow-[0_12px_40px_rgba(7,27,53,0.35)] backdrop-blur sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Ready to help
            <span
              className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[#071B35]/95"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0B3D91] to-[#071B35] p-[3px] shadow-[0_16px_40px_rgba(11,61,145,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(11,61,145,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A106] focus-visible:ring-offset-2"
            aria-haspopup="dialog"
            aria-expanded={false}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[#071B35]/20 ring-1 ring-[#D8A106]/50">
              <AskBezzinaAvatar size="md" attentive />
            </span>
            <span className="sr-only">Open Ask Bezzina — ready to help</span>
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          className="site-chrome fixed inset-0 z-[60] bg-[#071B35]/40 backdrop-blur-[3px] md:bg-[#071B35]/25"
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
          className="ask-bezzina-panel site-chrome fixed z-[60] flex w-[min(100vw-1rem,26rem)] flex-col overflow-hidden rounded-[28px] border border-white/40 bg-[#F4F7FB] shadow-[0_30px_90px_rgba(7,27,53,0.28)] bottom-20 right-2 max-h-[min(82vh,44rem)] md:bottom-6 md:right-6"
        >
          <header className="relative overflow-hidden px-4 pb-4 pt-3.5 text-white">
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,#071B35_0%,#0B3D91_55%,#0a4aa8_100%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 85% 20%, rgba(216,161,6,0.35), transparent 40%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12), transparent 35%)',
              }}
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-3">
              <AskBezzinaAvatar size="sm" attentive />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 id={titleId} className="truncate text-[15px] font-semibold tracking-tight">
                    Ask {company.shortName}
                  </h2>
                  <span className="hidden rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 sm:inline">
                    AI
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-emerald-200/95">
                  <span className="relative flex h-2 w-2">
                    <span className="ask-bezzina-online absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                  </span>
                  Online · catalogue specialist
                </p>
              </div>
              <Image
                src={company.logoUrl}
                alt=""
                width={30}
                height={30}
                className="rounded-xl bg-white object-contain p-0.5 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-white/85 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close Ask Bezzina"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="ask-bezzina-thread relative flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
            <AskBezzinaMessageList messages={messages} />

            {messages.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {QUICK_PROMPTS.map(({ label, prompt, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => submitMessage(prompt, null, null)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 px-2 py-3 text-center shadow-[0_4px_14px_rgba(7,27,53,0.05)] transition hover:-translate-y-0.5 hover:border-[#0B3D91]/30 hover:shadow-[0_8px_20px_rgba(11,61,145,0.1)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B3D91]/8 text-[#0B3D91]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {pending ? <AskBezzinaTypingIndicator /> : null}
            <div ref={listEndRef} />
          </div>

          <AskBezzinaComposer
            text={text}
            onTextChange={setText}
            pending={pending}
            error={error}
            imagePreviewUrl={imagePreviewUrl}
            onClearImage={() => clearImage()}
            onFileChange={handleFileChange}
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage(text.trim(), imageFile, imagePreviewUrl);
            }}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            canSend={Boolean(text.trim() || imageFile)}
          />
        </div>
      ) : null}
    </>
  );
}
