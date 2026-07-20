'use client';

import { Check, ClipboardList, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AskBezzinaAvatar } from '@/components/ask-bezzina/ask-bezzina-avatar';
import { buildQuoteLineItem } from '@/lib/products/build-cart-line-item';
import type { AskBezzinaMatch } from '@/lib/ask-bezzina/types';
import { useQuoteCart } from '@/context/quote-cart-context';

export type ChatBubble = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imagePreviewUrl?: string;
  matches?: AskBezzinaMatch[];
  isError?: boolean;
};

type Props = {
  messages: ChatBubble[];
};

function MatchCard({ match }: { match: AskBezzinaMatch }) {
  const { addItem } = useQuoteCart();
  const [added, setAdded] = useState(false);

  function handleAddToQuote() {
    addItem(
      buildQuoteLineItem({
        id: match.id,
        slug: match.slug,
        name: match.name,
        sku: match.sku,
        price: match.price,
        unit: match.unit,
        image_url: match.image_url,
      }),
    );
    setAdded(true);
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(7,27,53,0.04)]">
      <div className="flex gap-3 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {match.image_url ? (
            <Image src={match.image_url} alt="" fill className="object-cover" sizes="56px" />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-400">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold tracking-tight text-slate-900">
            {match.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-slate-500">
            {match.sku}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Link
              href={`/products/${match.slug}`}
              className="inline-flex items-center rounded-lg bg-[#0B3D91] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#09407a]"
            >
              View product
            </Link>
            <button
              type="button"
              onClick={handleAddToQuote}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-[#0B3D91]/40 hover:text-[#0B3D91]"
            >
              {added ? (
                <>
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Added
                </>
              ) : (
                <>
                  <ClipboardList className="h-3 w-3" aria-hidden="true" />
                  Quote
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function AskBezzinaMessageList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_8px_30px_rgba(7,27,53,0.06)] backdrop-blur-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#D8A106]/10"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-3.5">
          <AskBezzinaAvatar size="sm" attentive={false} />
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A5C00]">
              Catalogue assistant
            </p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              How can Bezzina help today?
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Ask about opening hours, get contact details, or send a clear part photo for catalogue
              matches and quote options.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3.5" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <li
            key={message.id}
            className={`ask-bezzina-msg flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}
          >
            {!isUser ? (
              <AskBezzinaAvatar size="sm" attentive={false} className="mt-0.5 shrink-0 scale-[0.92]" />
            ) : null}
            <div
              className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                isUser
                  ? 'rounded-[20px] rounded-br-md bg-gradient-to-br from-[#0B3D91] to-[#071B35] text-white shadow-[0_8px_20px_rgba(11,61,145,0.25)]'
                  : message.isError
                    ? 'rounded-[20px] rounded-bl-md border border-red-200/80 bg-red-50 text-red-800'
                    : 'rounded-[20px] rounded-bl-md border border-slate-200/70 bg-white/95 text-slate-800 shadow-[0_4px_16px_rgba(7,27,53,0.05)]'
              }`}
            >
              {message.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob preview from local File
                <img
                  src={message.imagePreviewUrl}
                  alt="Uploaded part"
                  className="mb-2.5 max-h-40 w-full rounded-2xl object-cover"
                />
              ) : null}
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.matches && message.matches.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {message.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AskBezzinaTypingIndicator() {
  return (
    <div className="flex items-end gap-2.5" role="status" aria-label="Ask Bezzina is typing">
      <AskBezzinaAvatar size="sm" attentive={false} className="scale-[0.92]" />
      <div className="inline-flex items-center gap-1.5 rounded-[18px] rounded-bl-md border border-slate-200/70 bg-white px-3.5 py-3 shadow-sm">
        <span className="ask-bezzina-dot h-1.5 w-1.5 rounded-full bg-[#0B3D91]" />
        <span className="ask-bezzina-dot ask-bezzina-dot-2 h-1.5 w-1.5 rounded-full bg-[#0B3D91]" />
        <span className="ask-bezzina-dot ask-bezzina-dot-3 h-1.5 w-1.5 rounded-full bg-[#0B3D91]" />
      </div>
    </div>
  );
}
