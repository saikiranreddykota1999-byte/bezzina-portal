type JsonLdValue = Record<string, unknown>;

type Props = {
  data: JsonLdValue | JsonLdValue[];
};

/** Serialize JSON-LD safely for embedding in HTML (escape `<` to avoid XSS breakouts). */
export function serializeJsonLd(data: JsonLdValue | JsonLdValue[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: Props) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
