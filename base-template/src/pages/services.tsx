import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import ServicesIntro from '@/components/Services/ServicesIntro';
import ServicesGrid from '@/components/Services/ServicesGrid';
import { PageProps } from '@/types';
import { GetStaticProps } from 'next';
import { getPageByName, getSiteData } from '@/lib/siteData';
import Link from 'next/link';
import ContactForm from '@/components/Contact/ContactForm';
import Features from '@/components/Features';
import CTA from '@/components/CTA';
import Map from '@/components/Contact/Map';

export default function ServicesPage({ page, site }: PageProps) {
  return (
    <>
      <Seo
        title={page.seo.metaTitle}
        description={page.seo.metaDescription}
        canonicalUrl={`https://${site.domain}/`}
        businessName={site.companyName}
        city={site.city}
        websiteUrl={`https://${site.domain}/`}
        schemaOrg={page.seo.schemaOrg}
        favicon={site.favIcon}
      />

      <Header navigation={site.navigation} site={site} />

      <main className="max-w-7xl mx-auto px-6 py-20">
        {page.sections.map((section) => {
          switch (section) {
            case 'Hero':
              return <ServicesIntro key="hero" content={page.content} />;

            case 'Services':
              return <ServicesGrid key="services" content={page.content} />;

            case 'CTA':
              return <CTA key="cta" site={site} content={page.content} />;

            case 'Benefits':
              return <Features key="benefits" content={page.content} />;

            case 'Contact':
              return <ContactForm key="contact" content={page.content} />;

            case 'Map':
              return <Map key="map" site={site} content={page.content} />;

            default:
              return null;
          }
        })}
        <div className="text-center mt-16">
          <Link
            href={site.heroCtaUrl}
            className="inline-block bg-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition"
          >
            {page.content.heroCtaText}
          </Link>
        </div>
      </main>

      <Footer navigation={site.navigation} site={site} />
    </>
  );
}
export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = getPageByName('services');
  const site = getSiteData();

  return {
    props: {
      page,
      site,
    },
  };
};
