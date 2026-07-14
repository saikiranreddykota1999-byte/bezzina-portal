import type { ImportRow } from '@/services/product-import.service';

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  category: 'category',
  subcategory: 'subcategory',
  product_name: 'product_name',
  name: 'product_name',
  product: 'product_name',
  product_sku: 'product_sku',
  sku: 'product_sku',
  variant_name: 'variant_name',
  variant: 'variant_name',
  size: 'variant_name',
  variant_sku: 'variant_sku',
  description: 'description',
  short_description: 'short_description',
  material: 'material',
  marine_grade: 'marine_grade',
  industrial_grade: 'industrial_grade',
  search_keywords: 'search_keywords',
  keywords: 'search_keywords',
  availability: 'availability',
};

export function parseCatalogueCsv(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.toLowerCase().replace(/\s+/g, '_'),
  );

  const rows: ImportRow[] = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row: ImportRow = { product_name: '' };

    headers.forEach((header, index) => {
      const key = HEADER_ALIASES[header];
      const value = values[index]?.trim();
      if (!key || !value) return;
      row[key] = value as never;
    });

    if (row.product_name.trim()) rows.push(row);
  }

  return rows;
}

export function parseVariantBulkText(text: string, productSku: string): Array<{
  name: string;
  sku: string;
}> {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, index) => ({
      name,
      sku: `${productSku}-V${String(index + 1).padStart(2, '0')}`,
    }));
}

export const IMPORT_CSV_TEMPLATE = `category,subcategory,product_name,product_sku,variant_name,variant_sku,description,material,marine_grade,industrial_grade,search_keywords,availability
Hand Tools,Combination Wrenches,Combination Wrench,IE-HT-001,10 mm,IE-HT-001-V01,Professional combination wrench,Chrome Vanadium Steel,false,true,wrench spanner,available`;
