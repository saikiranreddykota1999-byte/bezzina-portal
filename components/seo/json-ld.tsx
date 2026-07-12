type JsonLdValue = Record<string, unknown>;

type Props = {
  data: JsonLdValue | JsonLdValue[];
};

export function JsonLd({ data }: Props) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
