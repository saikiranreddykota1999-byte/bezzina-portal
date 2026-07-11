'use client';

import { useState } from 'react';
import { RippleButton } from '@/components/ui/ripple-button';

export default function SuggestionsPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Suggestion Box</h1>
      <p className="mt-1 text-sm text-slate-500">Tell us what products or brands you would like us to stock.</p>
      {sent ? (
        <p className="mt-8 text-green-600">Thank you for your suggestion!</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your suggestion..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <RippleButton type="submit">Submit Suggestion</RippleButton>
        </form>
      )}
    </div>
  );
}
