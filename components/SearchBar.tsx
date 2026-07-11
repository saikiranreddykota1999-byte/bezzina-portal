'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { quickSearchProductsAction } from '@/actions/search';
import { formatPrice, resolveProductPrice } from '@/lib/pricing';
import type { ProductSearchHit } from '@/lib/product-search';

type SearchBarVariant = 'hero' | 'default';

type SearchBarProps = {
  variant?: SearchBarVariant;
  className?: string;
  placeholder?: string;
};

const variantStyles: Record<
  SearchBarVariant,
  { input: string; dropdown: string; result: string; muted: string }
> = {
  hero: {
    input:
      'border-white/20 bg-white/10 text-white placeholder:text-slate-300 focus:border-orange-300 focus:bg-white/15 focus:ring-orange-400/60',
    dropdown: 'border-white/15 bg-slate-900 text-white shadow-xl shadow-slate-950/40',
    result: 'hover:bg-white/10',
    muted: 'text-slate-400',
  },
  default: {
    input:
      'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:ring-orange-500',
    dropdown: 'border-slate-200 bg-white text-slate-900 shadow-lg',
    result: 'hover:bg-slate-50',
    muted: 'text-slate-500',
  },
};

export function SearchBar({
  variant = 'default',
  className = '',
  placeholder = 'Search products by name, SKU, or specification...',
}: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const styles = variantStyles[variant];

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const response = await quickSearchProductsAction(trimmed);
    if (!response.success) {
      setError(response.error);
      setResults([]);
    } else {
      setResults(response.data);
      setError('');
    }

    setHasSearched(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function navigateToFullSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      router.push('/products');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToFullSearch(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      navigateToFullSearch(query);
    }
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          Search products
        </label>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
              variant === 'hero' ? 'text-slate-400' : 'text-slate-500'
            }`}
            aria-hidden
          />
          <input
            id={`${listboxId}-input`}
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-full border py-3.5 pl-12 pr-28 text-sm transition focus:outline-none focus:ring-2 sm:text-base ${styles.input}`}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Search
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border ${styles.dropdown}`}
        >
          {loading && (
            <div className={`flex items-center gap-2 px-4 py-3 text-sm ${styles.muted}`}>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </div>
          )}

          {!loading && error && (
            <p className="px-4 py-3 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && hasSearched && results.length === 0 && (
            <p className={`px-4 py-3 text-sm ${styles.muted}`}>No results found</p>
          )}

          {!loading && !error && results.length > 0 && (
            <ul>
              {results.map((product) => {
                const price = resolveProductPrice(product.price);
                return (
                  <li key={product.id} role="option">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition ${styles.result}`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <span className={`flex h-full items-center justify-center text-[10px] ${styles.muted}`}>
                            No image
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className={`truncate text-xs ${styles.muted}`}>{product.sku}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-orange-500">
                        {formatPrice(price)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !error && hasSearched && query.trim() && (
            <button
              type="button"
              onClick={() => navigateToFullSearch(query)}
              className={`w-full border-t px-4 py-3 text-left text-sm font-medium text-orange-500 transition ${styles.result}`}
            >
              View all results for “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
