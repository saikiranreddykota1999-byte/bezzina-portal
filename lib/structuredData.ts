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
  const siteUrl = input.url ?? getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: input.name ?? company.name,
    legalName: company.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(input.logoUrl ?? company.logoUrl),
    },
    image: toAbsoluteUrl(input.logoUrl ?? company.logoUrl),
    foundingDate: String(input.foundingDate ?? company.founded),
    address: getPostalAddressSchema(input.address ?? company.address),
    telephone: input.telephone ?? company.contact.phone1,
    email: input.email ?? company.contact.email,
    areaServed: {
      '@type': 'Country',
      name: 'Malta',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: input.telephone ?? company.contact.phone1,
        contactType: 'sales',
        areaServed: 'MT',
        availableLanguage: ['English', 'Maltese'],
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function getWebSiteSchema() {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: company.name,
    url: siteUrl,
    description: company.seo.description,
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en-MT',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getLocalBusinessSchema(input: {
  name?: string;
  imageUrl?: string;
  address?: PostalAddressInput;
  telephone?: string;
}) {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: input.name ?? company.name,
    image: toAbsoluteUrl(input.imageUrl ?? company.logoUrl),
    url: siteUrl,
    address: getPostalAddressSchema(input.address ?? company.address),
    telephone: input.telephone ?? company.contact.phone1,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.maps.latitude,
      longitude: company.maps.longitude,
    },
    // CONFIRM HOURS WITH CLIENT
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '16:00',
      },
    ],
    priceRange: '€€',
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

function resolveProductImages(product: Product): string[] {
  const urls = new Set<string>();
  if (product.image_url) {
    urls.add(toAbsoluteUrl(product.image_url));
  }
  product.images?.forEach((image) => {
    if (image.url) urls.add(toAbsoluteUrl(image.url));
  });
  return Array.from(urls);
}

export function getProductSchema(product: Product) {
  const category = product.category?.name ?? undefined;
  const description =
    product.seo_description ??
    product.description ??
    `View details for ${product.name} (${product.sku}).`;
  const images = resolveProductImages(product);
  const price = resolveProductPrice(product.price);
  const productUrl = `${getSiteUrl()}/products/${product.slug}`;

  const additionalProperty: Array<Record<string, string>> = [];
  if (product.material) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Material',
      value: product.material,
    });
  }
  if (product.standard) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Standard',
      value: product.standard,
    });
  }
  if (product.thread_type) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Thread',
      value: product.thread_type,
    });
  }
  if (Array.isArray(product.technical_specs)) {
    product.technical_specs.forEach((row) => {
      if (row.property && row.value) {
        additionalProperty.push({
          '@type': 'PropertyValue',
          name: row.property,
          value: row.value,
        });
      }
    });
  } else if (product.technical_specs && typeof product.technical_specs === 'object') {
    Object.entries(product.technical_specs).forEach(([key, value]) => {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: key,
        value: String(value),
      });
    });
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    sku: product.sku,
    url: productUrl,
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(category ? { category } : {}),
    brand: {
      '@type': 'Brand',
      name: product.brand?.name ?? company.name,
    },
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };

  if (price != null) {
    schema.offers = {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: mapAvailabilitySchema(product.availability),
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: company.name,
        '@id': `${getSiteUrl()}/#organization`,
      },
    };
  } else {
    // RFQ / quote-only SKUs — never publish a fake list price.
    schema.offers = {
      '@type': 'Offer',
      url: productUrl,
      availability: mapAvailabilitySchema(product.availability),
      priceCurrency: 'EUR',
      description: 'Request a quote for pricing',
      seller: {
        '@type': 'Organization',
        name: company.name,
        '@id': `${getSiteUrl()}/#organization`,
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

/** Collection / catalogue listing schema for /products, /marine, /industrial. */
export function getCollectionPageSchema(input: {
  name: string;
  description: string;
  path: string;
}) {
  const url = toAbsoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url,
    isPartOf: { '@id': `${getSiteUrl()}/#website` },
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
