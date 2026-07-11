'use client';

import { useState } from 'react';
import { RippleButton } from '@/components/ui/ripple-button';

export default function TicketsPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
      <p className="mt-1 text-sm text-slate-500">Open a ticket and our team will respond promptly.</p>
      {sent ? (
        <p className="mt-8 text-green-600">Ticket submitted. We will be in touch shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <RippleButton type="submit">Submit Ticket</RippleButton>
        </form>
      )}
    </div>
  );
}
