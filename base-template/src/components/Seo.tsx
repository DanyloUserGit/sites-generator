import Head from 'next/head';
interface SeoProps {
  title: string;
  description: string;
  canonicalUrl: string;
  businessName?: string;
  city?: string;
  phone?: string;
  websiteUrl?: string;
  schemaOrg?: Record<string, unknown>;
  favicon: string;
}

const Seo = ({
  title,
  description,
  canonicalUrl,
  businessName,
  city,
  phone,
  websiteUrl,
  schemaOrg,
  favicon,
}: SeoProps) => {
  const structuredData = schemaOrg
    ? schemaOrg
    : businessName && city
      ? {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: businessName,
          address: {
            '@type': 'PostalAddress',
            addressLocality: city,
            addressCountry: 'DE',
          },
          telephone: phone || undefined,
          url: websiteUrl || canonicalUrl,
        }
      : null;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" type="image/svg+xml" href={favicon} />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default Seo;
