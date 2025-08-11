import Hero from '@/components/Contact/Hero';
import ContactForm from '@/components/Contact/ContactForm';
import Map from '@/components/Contact/Map';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GetStaticProps } from 'next';
import { PageProps } from '@/types';
import { getPageByName, getSiteData } from '@/lib/siteData';

export default function ContactPage({ page, site }: PageProps) {
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
      {page.sections.map((section) => {
        switch (section) {
          case 'Hero':
            return <Hero key="hero" content={page.content} />;

          case 'Contact':
            return <ContactForm key="contact" content={page.content} />;

          case 'Map':
            return <Map key="map" site={site} content={page.content} />;

          default:
            return null;
        }
      })}

      <Footer navigation={site.navigation} site={site} />
    </>
  );
}
export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const page = getPageByName('contact');
  const site = getSiteData();

  return {
    props: {
      page,
      site,
    },
  };
};
