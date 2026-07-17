'use client';

import { FileText } from 'lucide-react';
import type { ProductDocument, ProductDocumentType } from '@/types/product';

const DOC_TYPE_LABELS: Record<ProductDocumentType, string> = {
  datasheet: 'Datasheet',
  sds: 'SDS',
  manual: 'Manual',
  pdf: 'PDF',
  catalogue: 'Catalogue',
  other: 'Other',
};

const DOC_TYPE_ORDER: ProductDocumentType[] = [
  'datasheet',
  'sds',
  'manual',
  'pdf',
  'catalogue',
  'other',
];

type Props = {
  documents: ProductDocument[];
};

export function ProductDownloads({ documents }: Props) {
  if (documents.length === 0) return null;

  const grouped = DOC_TYPE_ORDER.reduce<Record<ProductDocumentType, ProductDocument[]>>(
    (acc, type) => {
      const items = documents.filter((doc) => doc.doc_type === type);
      if (items.length > 0) acc[type] = items;
      return acc;
    },
    {} as Record<ProductDocumentType, ProductDocument[]>,
  );

  const groups = DOC_TYPE_ORDER.filter((type) => grouped[type]?.length);

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-slate-900">Downloads</h2>
      <div className="mt-3 space-y-4">
        {groups.map((type) => (
          <div key={type}>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {DOC_TYPE_LABELS[type]}
            </h3>
            <ul className="mt-2 space-y-2">
              {grouped[type].map((doc) => (
                <li key={doc.id}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-orange-800 hover:underline"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {doc.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
