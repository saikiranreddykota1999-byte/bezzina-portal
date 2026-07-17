import { getUserQuoteHistory } from '@/actions/quotes';
import Link from 'next/link';

export const metadata = { title: 'Quote History | My Account' };

export default async function QuoteHistoryPage() {
  const result = await getUserQuoteHistory();

  if (!result.success) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-700">{result.error}</p>
        <Link href="/account/login" className="mt-4 inline-block text-sm font-semibold text-orange-800 hover:underline">
          Sign in →
        </Link>
      </div>
    );
  }

  const quotes = result.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Quote History</h1>
      <p className="mt-1 text-sm text-slate-600">Your submitted quotation requests.</p>

      {quotes.length === 0 ? (
        <p className="mt-8 text-slate-600">
          No quotes yet.{' '}
          <Link href="/quote" className="text-orange-800 hover:underline">Build a quote →</Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {quotes.map((quote) => (
            <li key={quote.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{quote.reference}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {quote.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {new Date(quote.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              {quote.items && quote.items.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {quote.items.map((item: { id: string; name: string; sku: string; quantity: number }) => (
                    <li key={item.id}>
                      {item.name} ({item.sku}) × {item.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
