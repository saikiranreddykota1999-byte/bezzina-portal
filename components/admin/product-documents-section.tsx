'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2 } from 'lucide-react';
import { deleteProductDocument, uploadProductDocument } from '@/actions/admin-products';
import type { ProductDocument, ProductDocumentType } from '@/types/product';

const DOC_TYPES: { value: ProductDocumentType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'datasheet', label: 'Technical Datasheet' },
  { value: 'sds', label: 'Safety Data Sheet' },
  { value: 'manual', label: 'Instruction Manual' },
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'other', label: 'Other' },
];

type Props = {
  productId: string;
  documents: ProductDocument[];
};

export function ProductDocumentsSection({ productId, documents }: Props) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [docType, setDocType] = useState<ProductDocumentType>('pdf');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !label.trim()) {
      setError('Label and file are required');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label);
    formData.append('doc_type', docType);
    const result = await uploadProductDocument(productId, formData);
    if (!result.success) setError(result.error);
    else {
      setLabel('');
      router.refresh();
    }
    setUploading(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Downloadable Documents</h3>
      <ul className="mb-4 space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-orange-500" />
              <a href={doc.url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:underline">
                {doc.label}
              </a>
              <span className="text-xs text-slate-500">({doc.doc_type})</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await deleteProductDocument(doc.id, productId);
                router.refresh();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {documents.length === 0 && <p className="text-sm text-slate-500">No documents uploaded.</p>}
      </ul>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Document label"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as ProductDocumentType)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} disabled={uploading} className="text-sm" />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  );
}
