import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductBySlug } from '@/services/product.service';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Joseph Bezzina & Co Ltd' };
  }

  return {
    title: `${product.name} | Joseph Bezzina & Co Ltd`,
    description:
      product.description ?? `View details for ${product.name} (${product.sku}).`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductDetail product={product} />
    </main>
  );
}
