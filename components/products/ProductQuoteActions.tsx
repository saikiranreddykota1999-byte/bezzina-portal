'use client';

import { MessageCircle, ClipboardList } from 'lucide-react';
import { Product } from '@/types/product';
import { useQuoteCart } from '@/context/quote-cart-context';
import { buildProductQuoteMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

type Props = {
  product: Pick<Product, 'id' | 'slug' | 'name' | 'sku' | 'price' | 'unit' | 'image_url'>;
  layout?: 'card' | 'detail';
};

export function ProductQuoteActions({ product, layout = 'card' }: Props) {
  const { addItem, has } = useQuoteCart();
  const inQuote = has(product.id);

  const whatsappHref = buildWhatsAppUrl(buildProductQuoteMessage(product));

  const btnBase =
    layout === 'detail'
      ? 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition'
      : 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition';

  return (
    <div
      className={
        layout === 'detail'
          ? 'flex flex-col gap-3 sm:flex-row'
          : 'mt-3 flex flex-col gap-2'
      }
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} bg-[#25D366] text-white hover:bg-[#1da851]`}
      >
        <MessageCircle className="h-4 w-4" />
        Request Quote via WhatsApp
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            image_url: product.image_url,
          });
        }}
        className={`${btnBase} ${
          inQuote
            ? 'border border-orange-500 bg-orange-50 text-orange-700'
            : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
        }`}
      >
        <ClipboardList className="h-4 w-4" />
        {inQuote ? 'Added to Quote' : 'Add to Quote'}
      </button>
    </div>
  );
}
