'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { brandClasses } from '@/lib/brand';
import { buildQuoteLineItem } from '@/lib/products/build-cart-line-item';
import type { AskBezzinaMatch } from '@/lib/ask-bezzina/types';
import { useQuoteCart } from '@/context/quote-cart-context';

export type ChatBubble = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imagePreviewUrl?: string;
  matches?: AskBezzinaMatch[];
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
    <li className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {match.image_url ? (
            <Image
              src={match.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-slate-400">
              No image
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{match.name}</p>
          <p className="truncate text-xs text-slate-500">SKU: {match.sku}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/products/${match.slug}`}
              className={`${brandClasses.link} text-xs`}
            >
              View product
            </Link>
            <button
              type="button"
              onClick={handleAddToQuote}
              className="text-xs font-semibold text-[#9A3412] underline underline-offset-2 transition hover:text-[#7C2D12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 rounded-sm"
            >
              {added ? 'Added to quote' : 'Add to quote'}
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
      <div className="rounded-xl bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
        <p className="font-semibold text-slate-900">How can we help?</p>
        <p className="mt-2">
          Describe a part or upload a clear photo. We will identify what we can and
          suggest matches from the Bezzina catalogue.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <li key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                isUser
                  ? 'bg-[#0B3D91] text-white'
                  : 'border border-slate-200 bg-white text-slate-800'
              }`}
            >
              {message.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob preview from local File
                <img
                  src={message.imagePreviewUrl}
                  alt="Uploaded part"
                  className="mb-2 max-h-40 w-full rounded-lg object-cover"
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
