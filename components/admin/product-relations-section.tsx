'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  getAdminProductRelationsBundle,
  replaceProductRelations,
  searchProductsForRelationAction,
  type RelationProductPick,
  type RelationProductSummary,
} from '@/actions/admin-products/relations';
import type { ProductRelationType } from '@/types/product';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type RelationTab = ProductRelationType;

type RelationSectionConfig = {
  type: RelationTab;
  label: string;
  description: string;
};

const SECTIONS: RelationSectionConfig[] = [
  {
    type: 'related',
    label: 'Related Products',
    description: 'Shown as related items on the product detail page.',
  },
  {
    type: 'accessory',
    label: 'Accessories',
    description: 'Complementary products customers may need with this item.',
  },
  {
    type: 'fbt',
    label: 'Frequently Bought Together',
    description: 'Products commonly purchased alongside this item.',
  },
];

type SelectedProduct = RelationProductSummary;

type Props = {
  productId: string;
  relatedIds?: string[];
  accessoryIds?: string[];
  fbtIds?: string[];
  relatedLabels?: SelectedProduct[];
  accessoryLabels?: SelectedProduct[];
  fbtLabels?: SelectedProduct[];
};

function buildInitialState(): Record<RelationTab, SelectedProduct[]> {
  return { related: [], accessory: [], fbt: [] };
}

export function ProductRelationsSection(props: Props) {
  const { productId } = props;
  const [activeTab, setActiveTab] = useState<RelationTab>('related');
  const [selected, setSelected] = useState<Record<RelationTab, SelectedProduct[]>>(buildInitialState);
  const [saved, setSaved] = useState<Record<RelationTab, SelectedProduct[]>>(buildInitialState);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RelationProductPick[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const activeSection = SECTIONS.find((s) => s.type === activeTab) ?? SECTIONS[0];
  const activeSelected = selected[activeTab];
  const isDirty =
    JSON.stringify(activeSelected.map((p) => p.id)) !==
    JSON.stringify(saved[activeTab].map((p) => p.id));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await getAdminProductRelationsBundle(productId);
      if (cancelled) return;
      if (result.success && result.data) {
        setSelected(result.data);
        setSaved(result.data);
      } else if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const runSearch = useCallback(
    async (value: string) => {
      setSearching(true);
      setError('');
      const result = await searchProductsForRelationAction(value);
      if (result.success) {
        const existingIds = new Set([
          productId,
          ...selected.related.map((p) => p.id),
          ...selected.accessory.map((p) => p.id),
          ...selected.fbt.map((p) => p.id),
        ]);
        setResults((result.data ?? []).filter((p) => !existingIds.has(p.id)));
      } else {
        setError(result.error);
        setResults([]);
      }
      setSearching(false);
    },
    [productId, selected],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      void runSearch(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
    }
  }

  function addProduct(product: RelationProductPick) {
    setSelected((prev) => {
      const current = prev[activeTab];
      if (current.some((p) => p.id === product.id)) return prev;
      return {
        ...prev,
        [activeTab]: [...current, { id: product.id, name: product.name, sku: product.sku }],
      };
    });
    setResults((prev) => prev.filter((p) => p.id !== product.id));
    setQuery('');
  }

  function removeProduct(id: string) {
    setSelected((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((p) => p.id !== id),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setMessage('');
    const ids = selected[activeTab].map((p) => p.id);
    const result = await replaceProductRelations(productId, activeTab, ids);
    if (result.success) {
      setSaved((prev) => ({ ...prev, [activeTab]: [...selected[activeTab]] }));
      setMessage(`${activeSection.label} saved.`);
    } else {
      setError(result.error);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <section className={`${adminCardClass} p-5`}>
        <p className={`text-sm ${adminSubtextClass}`}>Loading product relations…</p>
      </section>
    );
  }

  return (
    <section className={`${adminCardClass} p-5`}>
      <h3 className={`mb-4 text-sm ${adminHeadingClass}`}>Product Relations</h3>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--admin-border-light)] pb-3">
        {SECTIONS.map((section) => (
          <button
            key={section.type}
            type="button"
            onClick={() => {
              setActiveTab(section.type);
              setQuery('');
              setResults([]);
              setMessage('');
              setError('');
            }}
            className={
              activeTab === section.type
                ? adminButtonPrimaryClass
                : adminButtonSecondaryClass
            }
          >
            {section.label}
            {selected[section.type].length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                {selected[section.type].length}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className={`mb-4 text-xs ${adminSubtextClass}`}>{activeSection.description}</p>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by name or SKU…"
          className={`${adminInputClass} pl-9`}
        />
      </div>

      {searching && <p className={`mb-2 text-xs ${adminSubtextClass}`}>Searching…</p>}

      {results.length > 0 && (
        <ul className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-[var(--admin-border-light)]">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => addProduct(product)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--admin-border-light)]"
              >
                <span className="font-medium text-[var(--admin-navy)]">{product.name}</span>
                <span className={`text-xs ${adminSubtextClass}`}>{product.sku}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeSelected.length === 0 ? (
        <p className={`mb-4 text-sm ${adminSubtextClass}`}>No products selected.</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {activeSelected.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-border-light)] px-3 py-1 text-sm"
            >
              <span className="font-medium text-[var(--admin-navy)]">{product.name}</span>
              {product.sku && (
                <span className={`text-xs ${adminSubtextClass}`}>({product.sku})</span>
              )}
              <button
                type="button"
                title="Remove"
                onClick={() => removeProduct(product.id)}
                className="ml-1 rounded-full p-0.5 text-[var(--admin-text-muted)] hover:bg-[var(--admin-danger-light)] hover:text-[var(--admin-danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={adminButtonPrimaryClass}
        >
          {saving ? 'Saving…' : `Save ${activeSection.label}`}
        </button>
        {message && <p className="text-xs text-[var(--admin-success)]">{message}</p>}
      </div>

      {error && <p className="mt-2 text-xs text-[var(--admin-danger)]">{error}</p>}
    </section>
  );
}
