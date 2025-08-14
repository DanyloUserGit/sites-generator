import ServicesGrid from '@/components/Services/ServicesGrid';
import CTA from '../components/CTA';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Seo from '../components/Seo';
import Header from './../components/Header';

import { getPageByName, getSiteData } from '@/lib/siteData';
import { PageProps } from '@/types/';
import { GetStaticProps } from 'next';
import ContactForm from '@/components/Contact/ContactForm';
import Map from '@/components/Contact/Map';

export default function Home({ page, site }: PageProps) {
  return (
    <>
      <Seo
        title={page.seo.metaTitle}
        description={page.seo.metaDescription}
        canonicalUrl={`https://${site.slug.replaceAll('/', '')}.com/`}
        businessName={site.companyName}
        city={site.city}
        websiteUrl={`https://${site.slug.replaceAll('/', '')}.com/`}
        schemaOrg={page.seo.schemaOrg}
        favicon={site.favIcon}
      />

      <Header navigation={site.navigation} site={site} />
      <main className="bg-white">
        {page.sections.map((section) => {
          switch (section) {
            case 'Hero':
              return <Hero key="hero" site={site} content={page.content} />;

            case 'Benefits':
              return <Features key="benefits" content={page.content} />;

            case 'CTA':
              return <CTA key="cta" site={site} content={page.content} />;
            case 'Services':
              return <ServicesGrid key="services" content={page.content} />;

            case 'Contact':
              return <ContactForm key="contact" content={page.content} />;

            case 'Map':
              return <Map key="map" site={site} content={page.content} />;

            default:
              return null;
          }
        })}
      </main>
      <Footer navigation={site.navigation} site={site} />
    </>
  );
}
export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = getPageByName('home');
  const site = getSiteData();

  return {
    props: {
      page,
      site,
    },
  };
};
