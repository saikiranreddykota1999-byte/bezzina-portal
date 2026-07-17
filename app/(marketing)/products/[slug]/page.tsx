import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import { RelatedProducts } from '@/components/products/related-products';
import { JsonLd } from '@/components/seo/json-ld';
import { buildProductBreadcrumbs } from '@/lib/breadcrumbs';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getProductSchema } from '@/lib/structuredData';
import {
  getProductBySlug,
  getProductRelations,
  getRelatedProducts,
} from '@/services/product.service';
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

  const primaryImage =
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    product.image_url;

  return buildPageMetadata({
    path: `/products/${slug}`,
    fallbackTitle: product.seo_title ?? `${product.name} | Joseph Bezzina & Co Ltd`,
    fallbackDescription:
      product.seo_description ??
      product.description ??
      `View details for ${product.name} (${product.sku}).`,
    fallbackImage: primaryImage,
    ogType: 'product',
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  void recordProductView(product.id);

  const [breadcrumbItems, relatedProducts, accessories, frequentlyBought] = await Promise.all([
    Promise.resolve(buildProductBreadcrumbs(product, { includeCurrentProduct: true })),
    getRelatedProducts(product),
    getProductRelations(product.id, 'accessory', 4),
    getProductRelations(product.id, 'fbt', 4),
  ]);

  return (
    <div>
      <JsonLd
        data={[getProductSchema(product), getBreadcrumbSchema(breadcrumbItems)]}
      />
      <ProductDetail product={product} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-12 md:px-8">
        <RelatedProducts
          products={relatedProducts}
          title="Related products"
          description="More items from the same category you may need."
        />
        <RelatedProducts
          products={accessories}
          title="Accessories"
          description="Complementary products commonly used with this item."
          showAddAllToQuote
        />
        <RelatedProducts
          products={frequentlyBought}
          title="Frequently bought together"
          description="Customers often request these items together."
          showAddAllToQuote
        />
      </div>
    </div>
  );
}
