'use client';

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
    <li className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80">
      <div className="flex gap-3 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
          {match.image_url ? (
            <Image src={match.image_url} alt="" fill className="object-cover" sizes="56px" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-slate-400">
              No image
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="truncate text-sm font-semibold text-slate-900">{match.name}</p>
          <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
            {match.sku}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/products/${match.slug}`}
              className="rounded-full bg-[#0B3D91] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#09407a]"
            >
              View
            </Link>
            <button
              type="button"
              onClick={handleAddToQuote}
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 transition hover:border-[#0B3D91] hover:text-[#0B3D91]"
            >
              {added ? 'Added' : 'Add to quote'}
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
      <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white px-4 py-5">
        <div className="flex items-start gap-3">
          <AskBezzinaAvatar size="sm" attentive={false} />
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-slate-900">Hi — how can we help?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Ask about hours or contact details, describe a part, or upload a clear photo for
              catalogue matches.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Business hours', 'Contact details', 'Identify a part'].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <li key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
            {!isUser ? (
              <AskBezzinaAvatar size="sm" attentive={false} className="mt-1 shrink-0 scale-90" />
            ) : null}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                isUser
                  ? 'rounded-br-md bg-[#0B3D91] text-white'
                  : message.isError
                    ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-800'
                    : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-800'
              }`}
            >
              {message.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob preview from local File
                <img
                  src={message.imagePreviewUrl}
                  alt="Uploaded part"
                  className="mb-2 max-h-40 w-full rounded-xl object-cover"
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
