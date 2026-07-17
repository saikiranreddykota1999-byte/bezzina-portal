import type { Product } from '@/types/product';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BuildProductBreadcrumbsOptions = {
  includeCurrentProduct?: boolean;
};

export function buildProductBreadcrumbs(
  product: Product,
  options: BuildProductBreadcrumbsOptions = {},
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
  ];

  if (product.category?.division) {
    const divisionHref = product.category.division === 'marine' ? '/marine' : '/industrial';
    crumbs.push({
      label: product.category.division === 'marine' ? 'Marine Supplies' : 'Industrial Equipment',
      href: divisionHref,
    });
  }

  if (product.category?.name && product.category.slug) {
    crumbs.push({
      label: product.category.name,
      href: `/products?category=${encodeURIComponent(product.category.slug)}`,
    });
  } else if (product.category?.name) {
    crumbs.push({ label: product.category.name });
  }

  if (options.includeCurrentProduct) {
    crumbs.push({ label: product.name, href: `/products/${product.slug}` });
  }

  return crumbs;
}

/** Generic marketing breadcrumb trail: Home → …sections → current. */
export function buildPageBreadcrumbs(
  sections: Array<{ label: string; href?: string }>,
): BreadcrumbItem[] {
  return [{ label: 'Home', href: '/' }, ...sections];
}
