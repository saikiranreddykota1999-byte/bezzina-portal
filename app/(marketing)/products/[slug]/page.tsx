import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import { RelatedProducts } from '@/components/products/related-products';
import { JsonLd } from '@/components/seo/json-ld';
import { buildProductBreadcrumbs } from '@/lib/breadcrumbs';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getProductSchema } from '@/lib/structuredData';
import { getProductBySlug, getRelatedProducts } from '@/services/product.service';
import { recordProductView } from '@/actions/customer-portal';
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Joseph Bezzina & Co Ltd' };
  }

  return buildPageMetadata({
    path: `/products/${slug}`,
    fallbackTitle: `${product.name} | Joseph Bezzina & Co Ltd`,
    fallbackDescription:
      product.seo_description ??
      product.description ??
      `View details for ${product.name} (${product.sku}).`,
  });
}
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  void recordProductView(product.id);

  const [breadcrumbItems, relatedProducts] = await Promise.all([
    Promise.resolve(buildProductBreadcrumbs(product, { includeCurrentProduct: true })),
    getRelatedProducts(product),
  ]);

  return (
    <main>
      <JsonLd
        data={[
          getProductSchema(product),
          getBreadcrumbSchema(breadcrumbItems),
        ]}
      />
      <ProductDetail product={product} />
      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}