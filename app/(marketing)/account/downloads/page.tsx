import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getCustomerDownloads } from '@/actions/customer-portal';

export const metadata = { title: 'Downloads | Account' };

export default async function DownloadsPage() {
  const result = await getCustomerDownloads();
  if (!result.success && result.error === 'Sign in required') redirect('/account/login');

  const downloads = result.success ? result.data ?? [] : [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Downloads</h1>
      <p className="mb-6 text-sm text-slate-600">
        Datasheets, manuals, and PDFs from products you have viewed.
      </p>

      {downloads.length === 0 ? (
        <p className="text-sm text-slate-600">
          No downloads available yet. Browse products to unlock documents.
        </p>
      ) : (
        <ul className="space-y-3">
          {downloads.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-800" />
                <div>
                  <p className="font-medium text-slate-900">{doc.label}</p>
                  <p className="text-xs text-slate-500">
                    {doc.product_name} · {doc.doc_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {doc.product_slug && (
                  <Link href={`/products/${doc.product_slug}`} className="text-xs text-slate-500 hover:text-slate-800">
                    View product
                  </Link>
                )}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-orange-800 hover:underline"
                >
                  Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
