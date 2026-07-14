import { company } from '@/config/company';
import type { BreadcrumbItem } from '@/lib/breadcrumbs';
import { resolveProductPrice } from '@/lib/pricing';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-url';
import type { Product, InventoryStatus } from '@/types/product';
import type { CompanySettings, SocialSettings } from '@/types/cms';

type PostalAddressInput = {
  line1: string;
  city: string;
  postalCode: string;
  country: string;
};

type OrganizationInput = {
  name?: string;
  url?: string;
  logoUrl?: string;
  foundingDate?: string | number;
  address?: PostalAddressInput;
  telephone?: string;
  email?: string;
  sameAs?: string[];
};

function toCountryCode(country: string): string {
  if (country.trim().toUpperCase() === 'MALTA') return 'MT';
  return country;
}

export function getPostalAddressSchema(address: PostalAddressInput) {
  return {
    '@type': 'PostalAddress',
    streetAddress: address.line1,
    addressLocality: address.city,
    postalCode: address.postalCode,
    addressCountry: toCountryCode(address.country),
  };
}

export function getOrganizationSchema(input: OrganizationInput = {}) {
  const sameAs = (input.sameAs ?? []).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name ?? company.name,
    url: input.url ?? getSiteUrl(),
    logo: toAbsoluteUrl(input.logoUrl ?? company.logoUrl),
    foundingDate: String(input.foundingDate ?? company.founded),
    address: getPostalAddressSchema(input.address ?? company.address),
    telephone: input.telephone ?? company.contact.phone1,
    email: input.email ?? company.contact.email,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function getLocalBusinessSchema(input: {
  name?: string;
  imageUrl?: string;
  address?: PostalAddressInput;
  telephone?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: input.name ?? company.name,
    image: toAbsoluteUrl(input.imageUrl ?? company.logoUrl),
    address: getPostalAddressSchema(input.address ?? company.address),
    telephone: input.telephone ?? company.contact.phone1,
    // CONFIRM HOURS WITH CLIENT
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '16:00',
      },
    ],
  };
}

function mapAvailabilitySchema(status?: InventoryStatus | string | null): string {
  switch (status) {
    case 'out_of_stock':
    case 'discontinued':
      return 'https://schema.org/OutOfStock';
    case 'limited_stock':
      return 'https://schema.org/LimitedAvailability';
    case 'coming_soon':
    case 'made_to_order':
    case 'special_order':
      return 'https://schema.org/PreOrder';
    default:
      return 'https://schema.org/InStock';
  }
}

function resolveProductImage(product: Product): string | undefined {
  const primary = product.images?.find((image) => image.is_primary) ?? product.images?.[0];
  const imageUrl = primary?.url ?? product.image_url;
  return imageUrl ? toAbsoluteUrl(imageUrl) : undefined;
}

export function getProductSchema(product: Product) {
  const category = product.category?.name ?? undefined;
  const description =
    product.seo_description ??
    product.description ??
    `View details for ${product.name} (${product.sku}).`;
  const image = resolveProductImage(product);
  const price = resolveProductPrice(product.price);
  const productUrl = `${getSiteUrl()}/products/${product.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    url: productUrl,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(category ? { category } : {}),
    brand: {
      '@type': 'Brand',
      name: product.brand?.name ?? company.name,
    },
  };

  if (price != null) {
    schema.offers = {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: mapAvailabilitySchema(product.availability),
      seller: {
        '@type': 'Organization',
        name: company.name,
      },
    };
  }

  return schema;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[], baseUrl = getSiteUrl()) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, string | number> = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      };

      if (item.href) {
        listItem.item = item.href.startsWith('http')
          ? item.href
          : `${normalizedBaseUrl}${item.href.startsWith('/') ? item.href : `/${item.href}`}`;
      }

      return listItem;
    }),
  };
}

export function buildOrganizationSchemaFromSettings(
  companySettings: Partial<CompanySettings>,
  socialSettings: Partial<SocialSettings>,
) {
  const sameAs = [socialSettings.facebook, socialSettings.linkedin, socialSettings.instagram].filter(
    (url): url is string => Boolean(url?.trim()),
  );
  const resolvedSameAs = sameAs.length > 0 ? sameAs : [company.social.facebook].filter(Boolean);

  return getOrganizationSchema({
    name: companySettings.name,
    logoUrl: companySettings.logoUrl,
    telephone: companySettings.phone,
    email: companySettings.email,
    sameAs: resolvedSameAs,
  });
}
